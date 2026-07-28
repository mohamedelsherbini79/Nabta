import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { createVitalsRecord, getVitalsForProfile, toVitalRecordSummary } from "@/lib/vitals";
import { vitalsRecordSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const patientProfileId = searchParams.get("patientProfileId");
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

  const windowDaysParam = searchParams.get("windowDays");
  const windowDays = windowDaysParam ? Number(windowDaysParam) : undefined;
  const records = await getVitalsForProfile(
    patientProfileId,
    windowDays && Number.isFinite(windowDays) ? windowDays : undefined,
  );

  return NextResponse.json({ records: records.map(toVitalRecordSummary) });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = vitalsRecordSchema.safeParse(body?.input);
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

  const data = parsed.data;
  const record = await createVitalsRecord(patientProfileId, {
    type: data.type,
    value: data.value,
    recordedAt: data.recordedAt,
  });

  await logAudit({
    actorUserId: user.id,
    action: "VITALS_RECORD_CREATE",
    entityType: "VitalsRecord",
    entityId: record.id,
  });

  return NextResponse.json({ record: toVitalRecordSummary(record) }, { status: 201 });
}
