import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { getActiveMedicationsForProfile } from "@/lib/medications";
import type { EmergencyCardScopeInput } from "@/lib/validation";

export interface EmergencyCardLinkSummary {
  id: string;
  token: string;
  scope: EmergencyCardScopeInput;
  createdAt: string;
}

export interface EmergencyCardData {
  displayName: string;
  bloodType: string | null;
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
}

export async function getActiveEmergencyCardLink(patientProfileId: string) {
  return prisma.qrShareLink.findFirst({
    where: { patientProfileId, purpose: "EMERGENCY_CARD", revokedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function createEmergencyCardLink(
  patientProfileId: string,
  userId: string,
  scope: EmergencyCardScopeInput,
) {
  await prisma.qrShareLink.updateMany({
    where: { patientProfileId, purpose: "EMERGENCY_CARD", revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return prisma.qrShareLink.create({
    data: {
      patientProfileId,
      token: randomUUID(),
      purpose: "EMERGENCY_CARD",
      scope: scope as unknown as Prisma.InputJsonValue,
      createdByUserId: userId,
    },
  });
}

export function revokeEmergencyCardLink(id: string) {
  return prisma.qrShareLink.update({ where: { id }, data: { revokedAt: new Date() } });
}

export function updateEmergencyContact(patientProfileId: string, name: string | null, phone: string | null) {
  return prisma.patientProfile.update({
    where: { id: patientProfileId },
    data: { emergencyContactName: name, emergencyContactPhone: phone },
  });
}

// Public lookup — no auth, callable from the unauthenticated (public) route.
export async function getEmergencyCardData(token: string): Promise<EmergencyCardData | null> {
  const link = await prisma.qrShareLink.findUnique({
    where: { token },
    include: { patientProfile: true },
  });

  if (!link || link.revokedAt || (link.expiresAt && link.expiresAt < new Date())) {
    return null;
  }

  await prisma.qrShareAccessLog.create({ data: { qrShareLinkId: link.id } });

  const scope = link.scope as unknown as EmergencyCardScopeInput;
  const profile = link.patientProfile;

  const medications = scope.medications
    ? (await getActiveMedicationsForProfile(profile.id)).map((m) => m.drugCatalog?.tradeName ?? m.customName ?? "—")
    : [];

  return {
    displayName: profile.displayName,
    bloodType: scope.bloodType ? profile.bloodType : null,
    allergies: scope.allergies ? profile.allergies : [],
    chronicConditions: scope.chronicConditions ? profile.chronicConditions : [],
    medications,
    emergencyContactName: scope.emergencyContact ? profile.emergencyContactName : null,
    emergencyContactPhone: scope.emergencyContact ? profile.emergencyContactPhone : null,
  };
}

interface QrShareLinkForSummary {
  id: string;
  token: string;
  scope: unknown;
  createdAt: Date;
}

export function toEmergencyCardLinkSummary(link: QrShareLinkForSummary): EmergencyCardLinkSummary {
  return {
    id: link.id,
    token: link.token,
    scope: link.scope as EmergencyCardScopeInput,
    createdAt: link.createdAt.toISOString(),
  };
}
