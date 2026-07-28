import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { getInteractionFindingsForDrug, getMedicationWithDetails } from "@/lib/medications";
import { topUpDoseWindow } from "@/lib/doseGeneration";
import { updateMedicationSchema } from "@/lib/validation";

export const runtime = "nodejs";

async function loadAuthorizedMedication(userId: string, id: string) {
  const medication = await getMedicationWithDetails(id);
  if (!medication) return null;
  const allowed = await canAccessProfile(userId, medication.patientProfileId);
  if (!allowed) return null;
  return medication;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const medication = await loadAuthorizedMedication(user.id, id);
  if (!medication) {
    return NextResponse.json({ error: "not_found", message: "Medication not found." }, { status: 404 });
  }

  const interactions = medication.drugCatalogId
    ? await getInteractionFindingsForDrug(medication.patientProfileId, medication.drugCatalogId, medication.id)
    : [];

  return NextResponse.json({ medication, interactions });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await loadAuthorizedMedication(user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "not_found", message: "Medication not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateMedicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const scheduleId = await prisma.$transaction(async (tx) => {
    await tx.medication.update({
      where: { id },
      data: {
        drugCatalogId: data.drugCatalogId,
        customName: data.customName,
        dosageForm: data.dosageForm,
        strength: data.strength,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });

    let updatedScheduleId: string | null = null;
    if (data.schedule) {
      const existingSchedule = existing.schedules[0];
      if (existingSchedule) {
        await tx.medicationSchedule.update({
          where: { id: existingSchedule.id },
          data: {
            timesOfDay: data.schedule.timesOfDay,
            daysOfWeek: data.schedule.daysOfWeek,
            timezone: data.schedule.timezone,
            ramadanShift: data.schedule.ramadanShift,
            active: data.schedule.active ?? true,
          },
        });
        updatedScheduleId = existingSchedule.id;
      } else if (data.schedule.timesOfDay && data.schedule.timezone) {
        const created = await tx.medicationSchedule.create({
          data: {
            medicationId: id,
            timesOfDay: data.schedule.timesOfDay,
            daysOfWeek: data.schedule.daysOfWeek ?? [],
            timezone: data.schedule.timezone,
            ramadanShift: data.schedule.ramadanShift ?? false,
          },
        });
        updatedScheduleId = created.id;
      }
    }

    if (data.stock) {
      await tx.medicationStock.upsert({
        where: { medicationId: id },
        create: {
          medicationId: id,
          quantityOnHand: data.stock.quantityOnHand,
          unit: data.stock.unit,
          lowStockThreshold: data.stock.lowStockThreshold,
          lastRestockedAt: new Date(),
        },
        update: {
          quantityOnHand: data.stock.quantityOnHand,
          unit: data.stock.unit,
          lowStockThreshold: data.stock.lowStockThreshold,
        },
      });
    }

    return updatedScheduleId;
  });

  if (scheduleId) {
    await topUpDoseWindow(scheduleId);
  }

  await logAudit({
    actorUserId: user.id,
    action: "MEDICATION_UPDATE",
    entityType: "Medication",
    entityId: id,
  });

  const medication = await getMedicationWithDetails(id);
  const interactions = medication?.drugCatalogId
    ? await getInteractionFindingsForDrug(medication.patientProfileId, medication.drugCatalogId, id)
    : [];

  return NextResponse.json({ medication, interactions });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await loadAuthorizedMedication(user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "not_found", message: "Medication not found." }, { status: 404 });
  }

  await prisma.medication.delete({ where: { id } });
  await logAudit({
    actorUserId: user.id,
    action: "MEDICATION_DELETE",
    entityType: "Medication",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
