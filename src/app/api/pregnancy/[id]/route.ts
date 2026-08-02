import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { deletePregnancy, toPregnancySummary, updatePregnancyNotes } from "@/lib/pregnancy";
import { pregnancyNotesSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const record = await prisma.pregnancyRecord.findUnique({ where: { id } });
  if (!record) {
    return NextResponse.json({ error: "not_found", message: "Pregnancy record not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, record.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Pregnancy record not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = pregnancyNotesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const updated = await updatePregnancyNotes(id, parsed.data);
  await logAudit({ actorUserId: user.id, action: "PREGNANCY_UPDATE", entityType: "PregnancyRecord", entityId: id });

  return NextResponse.json({ record: toPregnancySummary(updated) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const record = await prisma.pregnancyRecord.findUnique({ where: { id } });
  if (!record) {
    return NextResponse.json({ error: "not_found", message: "Pregnancy record not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, record.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Pregnancy record not found." }, { status: 404 });
  }

  await deletePregnancy(id);
  await logAudit({ actorUserId: user.id, action: "PREGNANCY_DELETE", entityType: "PregnancyRecord", entityId: id });

  return NextResponse.json({ success: true });
}
