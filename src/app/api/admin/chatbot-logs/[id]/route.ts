import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getConversationTranscript, toAdminMessageSummary } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden", message: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const messages = await getConversationTranscript(id);
  return NextResponse.json({ messages: messages.map(toAdminMessageSummary) });
}
