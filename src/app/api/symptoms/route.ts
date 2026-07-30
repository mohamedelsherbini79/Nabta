import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { createSymptomLog, getCorrelatedMedicationNames, getRecentSymptomLogs } from "@/lib/symptoms";
import { symptomLogSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const patientProfileId = searchParams.get("patientProfileId");
  const days = Number(searchParams.get("days") ?? 30);
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

  const logs = await getRecentSymptomLogs(patientProfileId, days);
  const medications: string[][] = [];
  for (const log of logs) {
    medications.push(await getCorrelatedMedicationNames(patientProfileId, log.loggedAt));
  }

  return NextResponse.json({
    logs: logs.map((log, i) => ({ ...log, medications: medications[i] })),
  });
}

export async function POST(req: Request) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = symptomLogSchema.safeParse(body?.input);
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

  const log = await createSymptomLog(patientProfileId, parsed.data);

  await logAudit({
    actorUserId: user.id,
    action: "SYMPTOM_LOG_CREATE",
    entityType: "SymptomLog",
    entityId: log.id,
  });

  return NextResponse.json({ log }, { status: 201 });
}
