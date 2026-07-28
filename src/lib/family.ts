import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSelfPatientProfile } from "@/lib/medications";
import type { DependentProfileInput } from "@/lib/validation";
import type { FamilyDelegateSummary, FamilyProfileSummary, PendingInviteSummary } from "@/types";

export const ACTIVE_PROFILE_COOKIE = "activeProfileId";

// The single place family authorization logic lives — call this at the top
// of any medication/vitals/reminder/etc. route instead of re-deriving access
// per feature.
export async function canAccessProfile(
  sessionUserId: string,
  patientProfileId: string,
): Promise<boolean> {
  const profile = await prisma.patientProfile.findUnique({
    where: { id: patientProfileId },
    include: { familyGroup: { include: { delegates: true } } },
  });
  if (!profile) return false;

  if (profile.familyGroup.headUserId === sessionUserId) return true;

  return profile.familyGroup.delegates.some(
    (d) =>
      d.delegateUserId === sessionUserId &&
      !!d.acceptedAt &&
      (!d.expiresAt || d.expiresAt > new Date()),
  );
}

export function getUserFamilyGroup(userId: string) {
  return prisma.familyGroup.findFirst({ where: { headUserId: userId } });
}

// Managing family structure itself (adding/editing/removing dependents,
// inviting/revoking delegates) is restricted to the family head — distinct
// from canAccessProfile, which also lets accepted delegates read/use data.
export async function isFamilyHead(userId: string, familyGroupId: string): Promise<boolean> {
  const group = await prisma.familyGroup.findUnique({ where: { id: familyGroupId } });
  return group?.headUserId === userId;
}

export async function getFamilyProfiles(userId: string) {
  const group = await getUserFamilyGroup(userId);
  if (!group) return [];
  return prisma.patientProfile.findMany({
    where: { familyGroupId: group.id },
    orderBy: { createdAt: "asc" },
  });
}

export function createDependentProfile(familyGroupId: string, input: DependentProfileInput) {
  return prisma.patientProfile.create({
    data: {
      familyGroupId,
      relationship: input.relationship,
      displayName: input.displayName,
      dob: input.dob,
      sex: input.sex,
      bloodType: input.bloodType,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      chronicConditions: input.chronicConditions,
      allergies: input.allergies,
    },
  });
}

export function updateDependentProfile(id: string, input: Partial<DependentProfileInput>) {
  return prisma.patientProfile.update({
    where: { id },
    data: {
      ...(input.displayName !== undefined && { displayName: input.displayName }),
      ...(input.relationship !== undefined && { relationship: input.relationship }),
      ...(input.dob !== undefined && { dob: input.dob }),
      ...(input.sex !== undefined && { sex: input.sex }),
      ...(input.bloodType !== undefined && { bloodType: input.bloodType }),
      ...(input.heightCm !== undefined && { heightCm: input.heightCm }),
      ...(input.weightKg !== undefined && { weightKg: input.weightKg }),
      ...(input.chronicConditions !== undefined && { chronicConditions: input.chronicConditions }),
      ...(input.allergies !== undefined && { allergies: input.allergies }),
    },
  });
}

export async function deleteDependentProfile(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await prisma.patientProfile.findUnique({ where: { id } });
  if (!profile) return { ok: false, error: "not_found" };
  if (profile.relationship === "SELF") return { ok: false, error: "cannot_delete_self" };

  await prisma.patientProfile.delete({ where: { id } });
  return { ok: true };
}

export async function inviteDelegate(
  familyGroupId: string,
  email: string,
  scope: "FULL" | "MEDICATION_ONLY" | "VIEW_ONLY",
): Promise<{ ok: true; delegate: Awaited<ReturnType<typeof prisma.familyDelegate.create>> } | { ok: false; error: string }> {
  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) return { ok: false, error: "user_not_found" };

  const group = await prisma.familyGroup.findUnique({ where: { id: familyGroupId } });
  if (group?.headUserId === targetUser.id) return { ok: false, error: "cannot_invite_self" };

  const existing = await prisma.familyDelegate.findUnique({
    where: { familyGroupId_delegateUserId: { familyGroupId, delegateUserId: targetUser.id } },
  });
  if (existing) return { ok: false, error: "already_invited" };

  const delegate = await prisma.familyDelegate.create({
    data: { familyGroupId, delegateUserId: targetUser.id, scope },
  });
  return { ok: true, delegate };
}

export async function acceptDelegateInvite(delegateId: string, userId: string) {
  const delegate = await prisma.familyDelegate.findUnique({ where: { id: delegateId } });
  if (!delegate || delegate.delegateUserId !== userId) return null;

  return prisma.familyDelegate.update({
    where: { id: delegateId },
    data: { acceptedAt: new Date() },
  });
}

export function revokeDelegate(id: string) {
  return prisma.familyDelegate.delete({ where: { id } });
}

export function getPendingInvitesForUser(userId: string) {
  return prisma.familyDelegate.findMany({
    where: { delegateUserId: userId, acceptedAt: null },
    include: { familyGroup: { include: { profiles: { where: { relationship: "SELF" } } } } },
  });
}

export function getDelegatesForFamilyGroup(familyGroupId: string) {
  return prisma.familyDelegate.findMany({
    where: { familyGroupId },
    include: { delegateUser: { select: { id: true, name: true, email: true } } },
    orderBy: { invitedAt: "asc" },
  });
}

export async function getAccessibleFamilyGroups(userId: string) {
  const owned = await getUserFamilyGroup(userId);
  const delegated = await prisma.familyDelegate.findMany({
    where: { delegateUserId: userId, acceptedAt: { not: null } },
    include: { familyGroup: true },
  });

  const groups = [
    ...(owned ? [owned] : []),
    ...delegated.map((d) => d.familyGroup).filter((g) => g.id !== owned?.id),
  ];

  return prisma.patientProfile.findMany({
    where: { familyGroupId: { in: groups.map((g) => g.id) } },
    orderBy: [{ familyGroupId: "asc" }, { createdAt: "asc" }],
  });
}

export async function getActivePatientProfile(userId: string) {
  const cookieStore = await cookies();
  const requestedId = cookieStore.get(ACTIVE_PROFILE_COOKIE)?.value;

  if (requestedId) {
    const allowed = await canAccessProfile(userId, requestedId);
    if (allowed) {
      const profile = await prisma.patientProfile.findUnique({ where: { id: requestedId } });
      if (profile) return profile;
    }
  }

  return getSelfPatientProfile(userId);
}

interface PatientProfileForSummary {
  id: string;
  familyGroupId: string;
  relationship: string;
  displayName: string;
  dob: Date | null;
  sex: string | null;
  bloodType: string | null;
  heightCm: number | null;
  weightKg: number | null;
  chronicConditions: string[];
  allergies: string[];
}

export function toFamilyProfileSummary(profile: PatientProfileForSummary): FamilyProfileSummary {
  return {
    id: profile.id,
    familyGroupId: profile.familyGroupId,
    relationship: profile.relationship as FamilyProfileSummary["relationship"],
    displayName: profile.displayName,
    dob: profile.dob ? profile.dob.toISOString().slice(0, 10) : null,
    sex: profile.sex,
    bloodType: profile.bloodType,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    chronicConditions: profile.chronicConditions,
    allergies: profile.allergies,
  };
}

interface FamilyDelegateForSummary {
  id: string;
  familyGroupId: string;
  delegateUser: { id: string; name: string | null; email: string };
  scope: string;
  invitedAt: Date;
  acceptedAt: Date | null;
  expiresAt: Date | null;
}

export function toFamilyDelegateSummary(delegate: FamilyDelegateForSummary): FamilyDelegateSummary {
  return {
    id: delegate.id,
    familyGroupId: delegate.familyGroupId,
    delegateUser: delegate.delegateUser,
    scope: delegate.scope as FamilyDelegateSummary["scope"],
    invitedAt: delegate.invitedAt.toISOString(),
    acceptedAt: delegate.acceptedAt ? delegate.acceptedAt.toISOString() : null,
    expiresAt: delegate.expiresAt ? delegate.expiresAt.toISOString() : null,
  };
}

interface PendingInviteForSummary {
  id: string;
  familyGroupId: string;
  scope: string;
  invitedAt: Date;
  familyGroup: { profiles: { displayName: string }[] };
}

export function toPendingInviteSummary(invite: PendingInviteForSummary): PendingInviteSummary {
  return {
    id: invite.id,
    familyGroupId: invite.familyGroupId,
    scope: invite.scope as PendingInviteSummary["scope"],
    invitedAt: invite.invitedAt.toISOString(),
    familyOwnerName: invite.familyGroup.profiles[0]?.displayName ?? "—",
  };
}
