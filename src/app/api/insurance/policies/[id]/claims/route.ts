import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { createClaim, toInsuranceClaimSummary } from "@/lib/insurance";
import { insuranceClaimSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const policy = await prisma.insurancePolicy.findUnique({ where: { id } });
  if (!policy) {
    return NextResponse.json({ error: "not_found", message: "Policy not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, policy.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Policy not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = insuranceClaimSchema.safeParse(body?.input);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const claim = await createClaim(id, parsed.data);
  await logAudit({ actorUserId: user.id, action: "INSURANCE_CLAIM_CREATE", entityType: "InsuranceClaim", entityId: claim.id });

  return NextResponse.json({ claim: toInsuranceClaimSummary(claim) }, { status: 201 });
}
