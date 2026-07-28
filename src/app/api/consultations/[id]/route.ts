import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import {
  cancelConsultation,
  getConsultationById,
  markConsultationCompleted,
  markConsultationNoShow,
  toConsultationSummary,
} from "@/lib/consultations";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const consultation = await getConsultationById(id);
  if (!consultation) {
    return NextResponse.json({ error: "not_found", message: "Consultation not found." }, { status: 404 });
  }

  const isDoctor = user.role === "DOCTOR" && consultation.doctorUserId === user.id;
  if (!isDoctor) {
    const allowed = await canAccessProfile(user.id, consultation.patientProfileId);
    if (!allowed) {
      return NextResponse.json({ error: "not_found", message: "Consultation not found." }, { status: 404 });
    }
  }

  const body = await req.json().catch(() => null);
  const status = body?.status;
  const allowedStatuses = isDoctor ? ["COMPLETED", "NO_SHOW"] : ["CANCELLED", "COMPLETED"];
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json(
      { error: "invalid_input", message: `status must be one of: ${allowedStatuses.join(", ")}.` },
      { status: 400 },
    );
  }

  let updated;
  if (status === "CANCELLED") updated = await cancelConsultation(id);
  else if (status === "NO_SHOW") updated = await markConsultationNoShow(id);
  else updated = await markConsultationCompleted(id);

  await logAudit({
    actorUserId: user.id,
    action: status === "CANCELLED" ? "CONSULTATION_CANCEL" : status === "NO_SHOW" ? "CONSULTATION_NO_SHOW" : "CONSULTATION_COMPLETE",
    entityType: "Consultation",
    entityId: id,
  });

  return NextResponse.json({ consultation: toConsultationSummary({ ...updated, doctor: null }) });
}
