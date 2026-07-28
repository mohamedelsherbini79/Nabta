import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUnreadNotificationsForUser, markNotificationReceiptRead } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const receipts = await getUnreadNotificationsForUser(user.id);
  return NextResponse.json({
    receipts: receipts.map((r) => ({
      receiptId: r.id,
      title: r.notification.title,
      body: r.notification.body,
      createdAt: r.notification.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const receiptId: string | undefined = body?.receiptId;
  if (!receiptId) {
    return NextResponse.json({ error: "invalid_input", message: "receiptId is required." }, { status: 400 });
  }

  const updated = await markNotificationReceiptRead(receiptId, user.id);
  if (!updated) {
    return NextResponse.json({ error: "not_found", message: "Receipt not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
