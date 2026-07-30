import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteDependentProfile, isFamilyHead, updateDependentProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { dependentProfileSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const profile = await prisma.patientProfile.findUnique({ where: { id } });
  if (!profile) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  const allowed = await isFamilyHead(user.id, profile.familyGroupId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = dependentProfileSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const updated = await updateDependentProfile(id, parsed.data);

  await logAudit({
    actorUserId: user.id,
    action: "FAMILY_PROFILE_UPDATE",
    entityType: "PatientProfile",
    entityId: id,
  });

  return NextResponse.json({ profile: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const profile = await prisma.patientProfile.findUnique({ where: { id } });
  if (!profile) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  const allowed = await isFamilyHead(user.id, profile.familyGroupId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  const result = await deleteDependentProfile(id);
  if (!result.ok) {
    const status = result.error === "not_found" ? 404 : 400;
    const message = result.error === "cannot_delete_self" ? "You cannot delete your own profile." : "Profile not found.";
    return NextResponse.json({ error: result.error, message }, { status });
  }

  await logAudit({
    actorUserId: user.id,
    action: "FAMILY_PROFILE_DELETE",
    entityType: "PatientProfile",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
