import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { toInsuranceClaimSummary, updateClaimStatus } from "@/lib/insurance";
import { insuranceClaimStatusSchema } from "@/lib/validation";

export const runtime = "nodejs";

// Claim status (SUBMITTED/APPROVED/REJECTED/PAID) is an adjudication
// decision, not something the claimant themselves should be able to set —
// restricted to staff (ADMIN), same pattern as src/app/api/admin/**.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden", message: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const claim = await prisma.insuranceClaim.findUnique({ where: { id } });
  if (!claim) {
    return NextResponse.json({ error: "not_found", message: "Claim not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = insuranceClaimStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const updated = await updateClaimStatus(id, parsed.data);
  await logAudit({ actorUserId: user.id, action: "INSURANCE_CLAIM_STATUS_UPDATE", entityType: "InsuranceClaim", entityId: id });

  return NextResponse.json({ claim: toInsuranceClaimSummary(updated) });
}
