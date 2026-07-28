import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { awardPoints } from "@/lib/loyalty";
import { doseStatusSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ doseId: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { doseId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = doseStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const dose = await prisma.dose.findUnique({
    where: { id: doseId },
    include: { schedule: { include: { medication: { include: { stock: true } } } } },
  });
  if (!dose) {
    return NextResponse.json({ error: "not_found", message: "Dose not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, dose.schedule.medication.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Dose not found." }, { status: 404 });
  }

  const previousStatus = dose.status;
  const newStatus = parsed.data.status;
  const stock = dose.schedule.medication.stock;
  const justTaken = newStatus === "TAKEN" && previousStatus !== "TAKEN";
  const shouldDecrement = justTaken && !!stock;

  const result = await prisma.$transaction(async (tx) => {
    const updatedDose = await tx.dose.update({
      where: { id: doseId },
      data: { status: newStatus, actedAt: new Date() },
    });

    let updatedStock = stock;
    if (shouldDecrement && stock) {
      updatedStock = await tx.medicationStock.update({
        where: { id: stock.id },
        data: { quantityOnHand: Math.max(0, stock.quantityOnHand - 1) },
      });
    }

    return { updatedDose, updatedStock };
  });

  if (justTaken) {
    await awardPoints(dose.schedule.medication.patientProfileId, 5, "DOSE_TAKEN");
  }

  await logAudit({
    actorUserId: user.id,
    action: "DOSE_STATUS_UPDATE",
    entityType: "Dose",
    entityId: doseId,
    metadata: { previousStatus, newStatus },
  });

  const lowStock = result.updatedStock
    ? result.updatedStock.quantityOnHand <= result.updatedStock.lowStockThreshold
    : false;

  return NextResponse.json({ dose: result.updatedDose, stock: result.updatedStock, lowStock });
}
