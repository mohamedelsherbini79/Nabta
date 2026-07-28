import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getConsultationsForDoctor, toDoctorConsultationSummary } from "@/lib/consultations";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "DOCTOR") {
    return NextResponse.json({ error: "forbidden", message: "Doctor access required." }, { status: 403 });
  }

  const consultations = await getConsultationsForDoctor(user.id);
  return NextResponse.json({ consultations: consultations.map(toDoctorConsultationSummary) });
}
