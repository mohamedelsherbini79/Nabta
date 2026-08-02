import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getFacilityCities, searchFacilities, toHealthFacilitySummary } from "@/lib/healthMap";
import { getCountryFromCookies } from "@/country/getCountryServer";
import { healthFacilitySearchSchema } from "@/lib/validation";

export const runtime = "nodejs";

// Global reference data, not patient-scoped — no canAccessProfile check needed.
// Scoped by the viewer's selected country (cookie) — the country toggle does
// a full page reload on change, so the cookie is always current by the time
// this route (or a client re-fetch) runs.
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = healthFacilitySearchSchema.safeParse({
    city: searchParams.get("city") ?? undefined,
    type: searchParams.get("type") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", message: "Invalid search input." }, { status: 400 });
  }

  const country = await getCountryFromCookies();
  const [facilities, cityRows] = await Promise.all([
    searchFacilities(country, parsed.data),
    getFacilityCities(country),
  ]);

  return NextResponse.json({
    facilities: facilities.map(toHealthFacilitySummary),
    cities: cityRows.map((row) => row.city),
  });
}
