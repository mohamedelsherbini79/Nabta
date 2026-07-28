import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import {
  getActiveMedicationsForProfile,
  getInteractionFindingsForDrug,
  getMedicationWithDetails,
} from "@/lib/medications";
import { topUpAllSchedulesForProfile, topUpDoseWindow } from "@/lib/doseGeneration";
import { addMedicationSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const patientProfileId = searchParams.get("patientProfileId");
  if (!patientProfileId) {
    return NextResponse.json(
      { error: "invalid_input", message: "patientProfileId is required." },
      { status: 400 },
    );
  }

  const allowed = await canAccessProfile(user.id, patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  await topUpAllSchedulesForProfile(patientProfileId);
  const medications = await getActiveMedicationsForProfile(patientProfileId);
  return NextResponse.json({ medications });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = addMedicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const allowed = await canAccessProfile(user.id, data.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const medication = await tx.medication.create({
      data: {
        patientProfileId: data.patientProfileId,
        drugCatalogId: data.drugCatalogId,
        customName: data.customName,
        dosageForm: data.dosageForm,
        strength: data.strength,
        addedVia: data.addedVia,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });

    let scheduleId: string | null = null;
    if (data.schedule) {
      const schedule = await tx.medicationSchedule.create({
        data: {
          medicationId: medication.id,
          timesOfDay: data.schedule.timesOfDay,
          daysOfWeek: data.schedule.daysOfWeek,
          timezone: data.schedule.timezone,
          ramadanShift: data.schedule.ramadanShift,
        },
      });
      scheduleId = schedule.id;
    }

    if (data.stock) {
      await tx.medicationStock.create({
        data: {
          medicationId: medication.id,
          quantityOnHand: data.stock.quantityOnHand,
          unit: data.stock.unit,
          lowStockThreshold: data.stock.lowStockThreshold,
          lastRestockedAt: new Date(),
        },
      });
    }

    return { medicationId: medication.id, scheduleId };
  });

  if (result.scheduleId) {
    await topUpDoseWindow(result.scheduleId);
  }

  const interactions = data.drugCatalogId
    ? await getInteractionFindingsForDrug(data.patientProfileId, data.drugCatalogId, result.medicationId)
    : [];

  await logAudit({
    actorUserId: user.id,
    action: "MEDICATION_CREATE",
    entityType: "Medication",
    entityId: result.medicationId,
  });

  const medication = await getMedicationWithDetails(result.medicationId);
  return NextResponse.json({ medication, interactions }, { status: 201 });
}
