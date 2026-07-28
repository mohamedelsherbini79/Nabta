import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { awardPoints } from "@/lib/loyalty";
import type { VitalRecordSummary, VitalsType, VitalValue } from "@/types";

const DEFAULT_WINDOW_DAYS = 90;

export function getVitalsForProfile(patientProfileId: string, windowDays = DEFAULT_WINDOW_DAYS) {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  return prisma.vitalsRecord.findMany({
    where: { patientProfileId, recordedAt: { gte: since } },
    orderBy: { recordedAt: "desc" },
  });
}

export function getVitalsRecordById(id: string) {
  return prisma.vitalsRecord.findUnique({ where: { id } });
}

export async function createVitalsRecord(
  patientProfileId: string,
  input: { type: VitalsType; value: VitalValue; recordedAt?: Date },
) {
  const record = await prisma.vitalsRecord.create({
    data: {
      patientProfileId,
      type: input.type,
      valueJson: input.value as unknown as Prisma.InputJsonValue,
      recordedAt: input.recordedAt ?? new Date(),
    },
  });
  await awardPoints(patientProfileId, 5, "VITALS_LOGGED");
  return record;
}

export function deleteVitalsRecord(id: string) {
  return prisma.vitalsRecord.delete({ where: { id } });
}

interface VitalsRecordForSummary {
  id: string;
  patientProfileId: string;
  type: string;
  valueJson: unknown;
  source: string;
  recordedAt: Date;
}

export function toVitalRecordSummary(record: VitalsRecordForSummary): VitalRecordSummary {
  return {
    id: record.id,
    patientProfileId: record.patientProfileId,
    type: record.type as VitalsType,
    value: record.valueJson as VitalValue,
    source: record.source,
    recordedAt: record.recordedAt.toISOString(),
  };
}
