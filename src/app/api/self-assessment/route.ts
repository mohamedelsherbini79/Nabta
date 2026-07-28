import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { getLatestSelfAssessment, submitSelfAssessment } from "@/lib/selfAssessment";
import { selfAssessmentSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const patientProfileId = searchParams.get("patientProfileId");
  if (!patientProfileId) {
    return NextResponse.json(
      { error: "invalid_input", message: "patientProfileId is required." },
      { status: 400 },
    );
  }

  const allowed = await canAccessProfile(user.id, patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  const assessment = await getLatestSelfAssessment(patientProfileId);
  const profile = await prisma.patientProfile.findUnique({ where: { id: patientProfileId } });

  return NextResponse.json({ assessment, profile });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = selfAssessmentSchema.safeParse(body?.input);
  const patientProfileId: string | undefined = body?.patientProfileId;
  if (!parsed.success || !patientProfileId) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.success ? "patientProfileId is required." : (parsed.error.issues[0]?.message ?? "Invalid input") },
      { status: 400 },
    );
  }

  const allowed = await canAccessProfile(user.id, patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  const { assessment, healthScore } = await submitSelfAssessment(patientProfileId, parsed.data);

  await logAudit({
    actorUserId: user.id,
    action: "SELF_ASSESSMENT_SUBMIT",
    entityType: "SelfAssessment",
    entityId: assessment.id,
  });

  return NextResponse.json({ assessment, healthScore }, { status: 201 });
}
