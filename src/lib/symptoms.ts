import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/loyalty";
import type { SymptomLogInput } from "@/lib/validation";

const CORRELATION_WINDOW_MS = 12 * 60 * 60 * 1000;

export function getRecentSymptomLogs(patientProfileId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return prisma.symptomLog.findMany({
    where: { patientProfileId, loggedAt: { gte: since } },
    orderBy: { loggedAt: "asc" },
  });
}

export async function createSymptomLog(patientProfileId: string, input: SymptomLogInput) {
  const log = await prisma.symptomLog.create({
    data: {
      patientProfileId,
      severity: input.severity,
      tags: input.tags,
      note: input.note,
      loggedAt: input.loggedAt ?? new Date(),
    },
  });
  await awardPoints(patientProfileId, 5, "SYMPTOM_LOGGED");
  return log;
}

export function deleteSymptomLog(id: string) {
  return prisma.symptomLog.delete({ where: { id } });
}

// No stored link table — correlation is computed at query time by matching a
// symptom log's timestamp against nearby TAKEN doses (see architecture notes).
export async function getCorrelatedMedicationNames(
  patientProfileId: string,
  loggedAt: Date,
): Promise<string[]> {
  const windowStart = new Date(loggedAt.getTime() - CORRELATION_WINDOW_MS);
  const windowEnd = new Date(loggedAt.getTime() + CORRELATION_WINDOW_MS);

  const doses = await prisma.dose.findMany({
    where: {
      status: "TAKEN",
      scheduledFor: { gte: windowStart, lte: windowEnd },
      schedule: { medication: { patientProfileId } },
    },
    include: { schedule: { include: { medication: { include: { drugCatalog: true } } } } },
  });

  const names = new Set<string>();
  for (const dose of doses) {
    const med = dose.schedule.medication;
    names.add(med.drugCatalog?.tradeName ?? med.customName ?? "—");
  }
  return Array.from(names);
}
