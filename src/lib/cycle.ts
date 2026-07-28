import { prisma } from "@/lib/prisma";
import type { CycleEntryInput } from "@/lib/validation";

export function getRecentCycleEntries(patientProfileId: string, limit = 12) {
  return prisma.menstrualCycleEntry.findMany({
    where: { patientProfileId },
    orderBy: { startDate: "desc" },
    take: limit,
  });
}

export function createCycleEntry(patientProfileId: string, input: CycleEntryInput) {
  return prisma.menstrualCycleEntry.create({
    data: {
      patientProfileId,
      startDate: input.startDate,
      endDate: input.endDate,
      flow: input.flow,
      symptoms: input.symptoms,
    },
  });
}

export function markCycleEnded(id: string, endDate: Date) {
  return prisma.menstrualCycleEntry.update({
    where: { id },
    data: { endDate },
  });
}

export function deleteCycleEntry(id: string) {
  return prisma.menstrualCycleEntry.delete({ where: { id } });
}
