import { prisma } from "@/lib/prisma";
import { computeDueDate, computePregnancyProgress } from "@/lib/pregnancyWeeks";
import type { PregnancyNotesInput, PregnancyRecordInput } from "@/lib/validation";
import type { PregnancySummary } from "@/types";

interface PregnancyRecordRow {
  id: string;
  lastPeriodDate: Date;
  dueDate: Date;
  status: string;
  notes: string | null;
  createdAt: Date;
}

export function getActivePregnancy(patientProfileId: string) {
  return prisma.pregnancyRecord.findFirst({
    where: { patientProfileId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
}

export function getPregnancyHistory(patientProfileId: string) {
  return prisma.pregnancyRecord.findMany({
    where: { patientProfileId },
    orderBy: { createdAt: "desc" },
  });
}

// Guards against creating a second ACTIVE record for the same profile (e.g.
// two open tabs both submitting the start-tracking form). The check and
// insert run inside one transaction so they see a consistent snapshot;
// returns null instead of a duplicate when one is already active.
export async function createPregnancy(patientProfileId: string, input: PregnancyRecordInput) {
  const dueDate = computeDueDate(input.lastPeriodDate);
  return prisma.$transaction(async (tx) => {
    const existing = await tx.pregnancyRecord.findFirst({
      where: { patientProfileId, status: "ACTIVE" },
    });
    if (existing) return null;

    return tx.pregnancyRecord.create({
      data: {
        patientProfileId,
        lastPeriodDate: input.lastPeriodDate,
        dueDate,
        notes: input.notes ?? null,
      },
    });
  });
}

export function updatePregnancyNotes(id: string, input: PregnancyNotesInput) {
  return prisma.pregnancyRecord.update({
    where: { id },
    data: { notes: input.notes ?? null },
  });
}

export function completePregnancy(id: string) {
  return prisma.pregnancyRecord.update({
    where: { id },
    data: { status: "COMPLETED" },
  });
}

export function deletePregnancy(id: string) {
  return prisma.pregnancyRecord.delete({ where: { id } });
}

export function toPregnancySummary(record: PregnancyRecordRow): PregnancySummary {
  const progress = computePregnancyProgress(record.lastPeriodDate);
  return {
    id: record.id,
    lastPeriodDate: record.lastPeriodDate.toISOString(),
    dueDate: record.dueDate.toISOString(),
    status: record.status as PregnancySummary["status"],
    notes: record.notes,
    currentWeek: progress.currentWeek,
    currentDay: progress.currentDay,
    trimester: progress.trimester,
    daysPregnant: progress.daysPregnant,
    daysUntilDue: progress.daysUntilDue,
    babySize: progress.babySize,
    tip: progress.tip,
    createdAt: record.createdAt.toISOString(),
  };
}
