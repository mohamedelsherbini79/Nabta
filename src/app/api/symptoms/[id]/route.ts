import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { deleteSymptomLog } from "@/lib/symptoms";

export const runtime = "nodejs";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const log = await prisma.symptomLog.findUnique({ where: { id } });
  if (!log) {
    return NextResponse.json({ error: "not_found", message: "Symptom log not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, log.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Symptom log not found." }, { status: 404 });
  }

  await deleteSymptomLog(id);
  await logAudit({
    actorUserId: user.id,
    action: "SYMPTOM_LOG_DELETE",
    entityType: "SymptomLog",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
