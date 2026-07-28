import { prisma } from "@/lib/prisma";
import { createReminder, deleteRemindersForEntity } from "@/lib/reminders";
import type { VaccinationRecordInput } from "@/lib/validation";
import type { VaccinationRecordSummary } from "@/types";

export function getVaccinationsForProfile(patientProfileId: string) {
  return prisma.vaccinationRecord.findMany({
    where: { patientProfileId },
  });
}

export async function createVaccinationRecord(patientProfileId: string, input: VaccinationRecordInput) {
  const record = await prisma.vaccinationRecord.create({
    data: {
      patientProfileId,
      vaccineName: input.vaccineName,
      doseNumber: input.doseNumber,
      administeredAt: input.administeredAt,
      dueAt: input.dueAt,
      status: input.administeredAt ? "ADMINISTERED" : "DUE",
    },
  });

  if (input.dueAt && !input.administeredAt) {
    await createReminder(
      patientProfileId,
      {
        label: `${input.vaccineName} — dose ${input.doseNumber}`,
        type: "VACCINATION",
        channel: "PUSH",
        scheduledFor: input.dueAt,
        recurrenceRule: "NONE",
        locationLabel: null,
      },
      { type: "VaccinationRecord", id: record.id },
    );
  }

  return record;
}

export async function markVaccinationAdministered(id: string, administeredAt: Date) {
  const updated = await prisma.vaccinationRecord.update({
    where: { id },
    data: { status: "ADMINISTERED", administeredAt },
  });
  await deleteRemindersForEntity("VaccinationRecord", id);
  return updated;
}

export async function deleteVaccinationRecord(id: string) {
  await deleteRemindersForEntity("VaccinationRecord", id);
  await prisma.vaccinationRecord.delete({ where: { id } });
}

interface VaccinationRecordForSummary {
  id: string;
  vaccineName: string;
  doseNumber: number;
  administeredAt: Date | null;
  dueAt: Date | null;
  status: string;
}

export function toVaccinationRecordSummary(record: VaccinationRecordForSummary): VaccinationRecordSummary {
  return {
    id: record.id,
    vaccineName: record.vaccineName,
    doseNumber: record.doseNumber,
    administeredAt: record.administeredAt ? record.administeredAt.toISOString() : null,
    dueAt: record.dueAt ? record.dueAt.toISOString() : null,
    status: record.status as VaccinationRecordSummary["status"],
  };
}
