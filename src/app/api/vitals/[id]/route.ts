import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { deleteVitalsRecord, getVitalsRecordById } from "@/lib/vitals";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const record = await getVitalsRecordById(id);
  if (!record) {
    return NextResponse.json({ error: "not_found", message: "Vitals record not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, record.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Vitals record not found." }, { status: 404 });
  }

  await deleteVitalsRecord(id);
  await logAudit({
    actorUserId: user.id,
    action: "VITALS_RECORD_DELETE",
    entityType: "VitalsRecord",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
