import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { getActiveMedicationsForProfile } from "@/lib/medications";
import { getVitalsForProfile, toVitalRecordSummary } from "@/lib/vitals";
import { getVaccinationsForProfile, toVaccinationRecordSummary } from "@/lib/vaccinations";
import { getRecentSymptomLogs } from "@/lib/symptoms";
import type { DoctorShareLinkInput, DoctorShareScopeInput } from "@/lib/validation";
import type { VaccinationRecordSummary, VitalRecordSummary } from "@/types";

const DATA_WINDOW_DAYS = 30;

export interface DoctorShareLinkSummary {
  id: string;
  token: string;
  scope: DoctorShareScopeInput;
  expiresAt: string | null;
  createdAt: string;
}

export function getActiveDoctorShareLinks(patientProfileId: string) {
  return prisma.qrShareLink.findMany({
    where: { patientProfileId, purpose: "DOCTOR_SHARE", revokedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export function createDoctorShareLink(patientProfileId: string, userId: string, input: DoctorShareLinkInput) {
  const expiresAt = new Date(Date.now() + input.expiresInHours * 60 * 60 * 1000);
  return prisma.qrShareLink.create({
    data: {
      patientProfileId,
      token: randomUUID(),
      purpose: "DOCTOR_SHARE",
      scope: input.scope as unknown as Prisma.InputJsonValue,
      createdByUserId: userId,
      expiresAt,
    },
  });
}

export function revokeDoctorShareLink(id: string) {
  return prisma.qrShareLink.update({ where: { id }, data: { revokedAt: new Date() } });
}

export interface DoctorShareMedication {
  name: string;
  dosageForm: string | null;
  strength: string | null;
}

export interface DoctorShareSymptomLog {
  severity: number;
  tags: string[];
  note: string | null;
  loggedAt: string;
}

export interface DoctorShareData {
  displayName: string;
  dob: string | null;
  sex: string | null;
  heightCm: number | null;
  weightKg: number | null;
  bloodType: string | null;
  allergies: string[];
  chronicConditions: string[];
  medications: DoctorShareMedication[];
  vitals: VitalRecordSummary[];
  vaccinations: VaccinationRecordSummary[];
  symptoms: DoctorShareSymptomLog[];
  expiresAt: string | null;
}

// Public lookup — no auth, callable from the unauthenticated (public) route.
// Sequential awaits (not Promise.all): concurrent queries against the local
// dev Postgres pooler have been observed to intermittently fail — see the
// Header.tsx fix from the Reminders module.
export async function getDoctorShareData(token: string): Promise<DoctorShareData | null> {
  const link = await prisma.qrShareLink.findUnique({
    where: { token },
    include: { patientProfile: true },
  });

  if (
    !link ||
    link.purpose !== "DOCTOR_SHARE" ||
    link.revokedAt ||
    (link.expiresAt && link.expiresAt < new Date())
  ) {
    return null;
  }

  await prisma.qrShareAccessLog.create({ data: { qrShareLinkId: link.id } });

  const scope = link.scope as unknown as DoctorShareScopeInput;
  const profile = link.patientProfile;

  const medicationRecords = scope.medications ? await getActiveMedicationsForProfile(profile.id) : [];
  const vitalRecords = scope.vitals ? await getVitalsForProfile(profile.id, DATA_WINDOW_DAYS) : [];
  const vaccinationRecords = scope.vaccinations ? await getVaccinationsForProfile(profile.id) : [];
  const symptomRecords = scope.symptoms ? await getRecentSymptomLogs(profile.id, DATA_WINDOW_DAYS) : [];

  return {
    displayName: profile.displayName,
    dob: scope.demographics && profile.dob ? profile.dob.toISOString().slice(0, 10) : null,
    sex: scope.demographics ? profile.sex : null,
    heightCm: scope.demographics ? profile.heightCm : null,
    weightKg: scope.demographics ? profile.weightKg : null,
    bloodType: scope.bloodType ? profile.bloodType : null,
    allergies: scope.allergies ? profile.allergies : [],
    chronicConditions: scope.chronicConditions ? profile.chronicConditions : [],
    medications: medicationRecords.map((m) => ({
      name: m.drugCatalog?.tradeName ?? m.customName ?? "—",
      dosageForm: m.dosageForm,
      strength: m.strength,
    })),
    vitals: vitalRecords.map(toVitalRecordSummary),
    vaccinations: vaccinationRecords.map(toVaccinationRecordSummary),
    symptoms: symptomRecords.map((s) => ({
      severity: s.severity,
      tags: s.tags,
      note: s.note,
      loggedAt: s.loggedAt.toISOString(),
    })),
    expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
  };
}

interface QrShareLinkForSummary {
  id: string;
  token: string;
  scope: unknown;
  expiresAt: Date | null;
  createdAt: Date;
}

export function toDoctorShareLinkSummary(link: QrShareLinkForSummary): DoctorShareLinkSummary {
  return {
    id: link.id,
    token: link.token,
    scope: link.scope as DoctorShareScopeInput,
    expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
    createdAt: link.createdAt.toISOString(),
  };
}
