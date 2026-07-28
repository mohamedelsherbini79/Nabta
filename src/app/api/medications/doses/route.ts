import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessProfile } from "@/lib/family";
import { topUpAllSchedulesForProfile } from "@/lib/doseGeneration";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const patientProfileId = searchParams.get("patientProfileId");
  const range = searchParams.get("range") === "today" ? "today" : "upcoming";
  if (!patientProfileId) {
    return NextResponse.json(
      { error: "invalid_input", message: "patientProfileId is required." },
      { status: 400 },
    );
  }

  const allowed = await canAccessProfile(user.id, patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  await topUpAllSchedulesForProfile(patientProfileId);

  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const rangeEnd =
    range === "today"
      ? new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
      : new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

  const doses = await prisma.dose.findMany({
    where: {
      scheduledFor: { gte: startOfToday, lt: rangeEnd },
      schedule: { medication: { patientProfileId } },
    },
    include: {
      schedule: { include: { medication: { include: { drugCatalog: true } } } },
    },
    orderBy: { scheduledFor: "asc" },
  });

  return NextResponse.json({ doses });
}
