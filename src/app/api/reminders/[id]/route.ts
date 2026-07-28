import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { deleteReminder, toReminderSummary, updateReminder } from "@/lib/reminders";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (!reminder) {
    return NextResponse.json({ error: "not_found", message: "Reminder not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, reminder.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Reminder not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const updated = await updateReminder(id, {
    label: typeof body?.label === "string" ? body.label : undefined,
    scheduledFor: body?.scheduledFor ? new Date(body.scheduledFor) : undefined,
    recurrenceRule: body?.recurrenceRule ?? undefined,
    active: typeof body?.active === "boolean" ? body.active : undefined,
  });

  await logAudit({ actorUserId: user.id, action: "REMINDER_UPDATE", entityType: "Reminder", entityId: id });

  return NextResponse.json({ reminder: toReminderSummary(updated) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (!reminder) {
    return NextResponse.json({ error: "not_found", message: "Reminder not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, reminder.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Reminder not found." }, { status: 404 });
  }

  await deleteReminder(id);
  await logAudit({ actorUserId: user.id, action: "REMINDER_DELETE", entityType: "Reminder", entityId: id });

  return NextResponse.json({ success: true });
}
