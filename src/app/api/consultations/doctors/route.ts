import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/session";
import { getDemoDoctors, toDoctorSummary } from "@/lib/consultations";
import { getCountryFromCookies } from "@/country/getCountryServer";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const country = await getCountryFromCookies();
  const doctors = await getDemoDoctors(country);
  return NextResponse.json({ doctors: doctors.map(toDoctorSummary) });
}
