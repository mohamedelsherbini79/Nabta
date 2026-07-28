import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { deleteVaccinationRecord, markVaccinationAdministered, toVaccinationRecordSummary } from "@/lib/vaccinations";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const record = await prisma.vaccinationRecord.findUnique({ where: { id } });
  if (!record) {
    return NextResponse.json({ error: "not_found", message: "Vaccination record not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, record.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Vaccination record not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const administeredAt = body?.administeredAt ? new Date(body.administeredAt) : new Date();
  if (Number.isNaN(administeredAt.getTime())) {
    return NextResponse.json({ error: "invalid_input", message: "Invalid date." }, { status: 400 });
  }

  const updated = await markVaccinationAdministered(id, administeredAt);
  await logAudit({ actorUserId: user.id, action: "VACCINATION_UPDATE", entityType: "VaccinationRecord", entityId: id });

  return NextResponse.json({ record: toVaccinationRecordSummary(updated) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const record = await prisma.vaccinationRecord.findUnique({ where: { id } });
  if (!record) {
    return NextResponse.json({ error: "not_found", message: "Vaccination record not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, record.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Vaccination record not found." }, { status: 404 });
  }

  await deleteVaccinationRecord(id);
  await logAudit({ actorUserId: user.id, action: "VACCINATION_DELETE", entityType: "VaccinationRecord", entityId: id });

  return NextResponse.json({ success: true });
}
