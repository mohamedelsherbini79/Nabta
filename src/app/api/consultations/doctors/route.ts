import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/session";
import { getDemoDoctors, toDoctorSummary } from "@/lib/consultations";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const doctors = await getDemoDoctors();
  return NextResponse.json({ doctors: doctors.map(toDoctorSummary) });
}
