import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { createConsultation, getConsultationsForProfile, toConsultationSummary } from "@/lib/consultations";
import { bookConsultationSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const patientProfileId = searchParams.get("patientProfileId");
  if (!patientProfileId) {
    return NextResponse.json({ error: "invalid_input", message: "patientProfileId is required." }, { status: 400 });
  }

  const allowed = await canAccessProfile(user.id, patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  const consultations = await getConsultationsForProfile(patientProfileId);
  return NextResponse.json({ consultations: consultations.map(toConsultationSummary) });
}

export async function POST(req: Request) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bookConsultationSchema.safeParse(body?.input);
  const patientProfileId: string | undefined = body?.patientProfileId;
  if (!parsed.success || !patientProfileId) {
    return NextResponse.json(
      {
        error: "invalid_input",
        message: parsed.success ? "patientProfileId is required." : (parsed.error.issues[0]?.message ?? "Invalid input"),
      },
      { status: 400 },
    );
  }

  const allowed = await canAccessProfile(user.id, patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  const consultation = await createConsultation(patientProfileId, parsed.data.doctorUserId, parsed.data.scheduledFor);
  if (!consultation) {
    return NextResponse.json({ error: "slot_taken", message: "This time slot was just booked. Please pick another." }, { status: 409 });
  }

  await logAudit({ actorUserId: user.id, action: "CONSULTATION_BOOK", entityType: "Consultation", entityId: consultation.id });

  return NextResponse.json({ consultation: toConsultationSummary({ ...consultation, doctor: null }) }, { status: 201 });
}
