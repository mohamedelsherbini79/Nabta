import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getAllConversationsAdmin, toAdminConversationSummary } from "@/lib/admin";

export const runtime = "nodejs";

const VALID_KINDS = ["PATIENT_AI", "PHARMACIST", "SUPPORT"] as const;

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden", message: "Admin access required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const kindParam = searchParams.get("kind");
  const kind = (VALID_KINDS as readonly string[]).includes(kindParam ?? "")
    ? (kindParam as (typeof VALID_KINDS)[number])
    : undefined;

  const conversations = await getAllConversationsAdmin(kind);
  return NextResponse.json({ conversations: conversations.map(toAdminConversationSummary) });
}
