import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { completePregnancy, toPregnancySummary } from "@/lib/pregnancy";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const record = await prisma.pregnancyRecord.findUnique({ where: { id } });
  if (!record) {
    return NextResponse.json({ error: "not_found", message: "Pregnancy record not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, record.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Pregnancy record not found." }, { status: 404 });
  }

  const updated = await completePregnancy(id);
  await logAudit({ actorUserId: user.id, action: "PREGNANCY_COMPLETE", entityType: "PregnancyRecord", entityId: id });

  return NextResponse.json({ record: toPregnancySummary(updated) });
}
