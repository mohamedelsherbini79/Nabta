import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/session";
import { createDependentProfile, getAccessibleFamilyGroups, getUserFamilyGroup } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { dependentProfileSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const profiles = await getAccessibleFamilyGroups(user.id);
  return NextResponse.json({ profiles });
}

export async function POST(req: Request) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = dependentProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const group = await getUserFamilyGroup(user.id);
  if (!group) {
    return NextResponse.json({ error: "not_found", message: "No family group found." }, { status: 404 });
  }

  const profile = await createDependentProfile(group.id, parsed.data);

  await logAudit({
    actorUserId: user.id,
    action: "FAMILY_PROFILE_CREATE",
    entityType: "PatientProfile",
    entityId: profile.id,
  });

  return NextResponse.json({ profile }, { status: 201 });
}
