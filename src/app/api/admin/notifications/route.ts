import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { createSystemNotification, getRecentSystemNotifications } from "@/lib/admin";
import { systemNotificationSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden", message: "Admin access required." }, { status: 403 });
  }

  const notifications = await getRecentSystemNotifications();
  return NextResponse.json({ notifications });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden", message: "Only admins can broadcast notifications." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = systemNotificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const notification = await createSystemNotification(parsed.data.title, parsed.data.body);
  await logAudit({ actorUserId: user.id, action: "ADMIN_NOTIFICATION_BROADCAST", entityType: "SystemNotification", entityId: notification.id });

  return NextResponse.json({ notification }, { status: 201 });
}
