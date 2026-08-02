import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { gemini, buildSystemPrompt, CHAT_MODEL } from "@/lib/gemini";
import { chatMessageSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";
import { getCountryFromCookies } from "@/country/getCountryServer";

export const runtime = "nodejs";

const HISTORY_LIMIT = 20;
const TITLE_LENGTH = 60;
const CHAT_RATE_LIMIT = 20;
const CHAT_RATE_WINDOW_MS = 60_000;

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  if (!checkRateLimit(`chat:${user.id}`, CHAT_RATE_LIMIT, CHAT_RATE_WINDOW_MS)) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many messages, please slow down." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { conversationId, message, kind } = parsed.data;

  const conversation = conversationId
    ? await prisma.conversation.findFirst({ where: { id: conversationId, userId: user.id } })
    : await prisma.conversation.create({
        data: { userId: user.id, title: message.slice(0, TITLE_LENGTH), kind: kind ?? "PATIENT_AI" },
      });

  if (!conversation) {
    return NextResponse.json(
      { error: "not_found", message: "Conversation not found." },
      { status: 404 },
    );
  }

  await prisma.message.create({
    data: { conversationId: conversation.id, role: "USER", content: message },
  });

  const history = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    take: HISTORY_LIMIT,
  });

  const geminiContents = history.map((m) => ({
    role: (m.role === "USER" ? "user" : "model") as "user" | "model",
    parts: [{ text: m.content }],
  }));

  const country = await getCountryFromCookies();

  let fullText = "";
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = await gemini.models.generateContentStream({
          model: CHAT_MODEL,
          contents: geminiContents,
          config: { systemInstruction: buildSystemPrompt(conversation.kind as "PATIENT_AI" | "PHARMACIST", country) },
        });

        for await (const chunk of stream) {
          const delta = chunk.text;
          if (delta) {
            fullText += delta;
            controller.enqueue(encoder.encode(delta));
          }
        }

        if (fullText.trim().length > 0) {
          await prisma.message.create({
            data: { conversationId: conversation.id, role: "ASSISTANT", content: fullText },
          });
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Conversation-Id": conversation.id,
    },
  });
}
