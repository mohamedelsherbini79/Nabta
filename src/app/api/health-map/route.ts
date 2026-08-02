import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getFacilityCities, searchFacilities, toHealthFacilitySummary } from "@/lib/healthMap";
import { healthFacilitySearchSchema } from "@/lib/validation";

export const runtime = "nodejs";

// Global reference data, not patient-scoped — no canAccessProfile check needed.
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

  const [facilities, cityRows] = await Promise.all([searchFacilities(parsed.data), getFacilityCities()]);

  return NextResponse.json({
    facilities: facilities.map(toHealthFacilitySummary),
    cities: cityRows.map((row) => row.city),
  });
}
