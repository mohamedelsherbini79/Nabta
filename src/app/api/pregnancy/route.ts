import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { createPregnancy, getActivePregnancy, getPregnancyHistory, toPregnancySummary } from "@/lib/pregnancy";
import { pregnancyRecordSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getSessionUser();
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

  const [active, history] = await Promise.all([
    getActivePregnancy(patientProfileId),
    getPregnancyHistory(patientProfileId),
  ]);

  return NextResponse.json({
    active: active ? toPregnancySummary(active) : null,
    history: history.map(toPregnancySummary),
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = pregnancyRecordSchema.safeParse(body?.input);
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

  const record = await createPregnancy(patientProfileId, parsed.data);
  if (!record) {
    return NextResponse.json(
      { error: "already_active", message: "A pregnancy is already being tracked for this profile." },
      { status: 409 },
    );
  }
  await logAudit({ actorUserId: user.id, action: "PREGNANCY_CREATE", entityType: "PregnancyRecord", entityId: record.id });

  return NextResponse.json({ record: toPregnancySummary(record) }, { status: 201 });
}
