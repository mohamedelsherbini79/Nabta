import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { generateReport, getReportsForProfile, toReportSummary } from "@/lib/reports";

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

  const reports = await getReportsForProfile(patientProfileId);
  return NextResponse.json({ reports: reports.map(toReportSummary) });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const patientProfileId: string | undefined = body?.patientProfileId;
  if (!patientProfileId) {
    return NextResponse.json({ error: "invalid_input", message: "patientProfileId is required." }, { status: 400 });
  }

  const allowed = await canAccessProfile(user.id, patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  const report = await generateReport(patientProfileId);
  await logAudit({ actorUserId: user.id, action: "REPORT_GENERATE", entityType: "MonthlyReport", entityId: report.id });

  return NextResponse.json({ report: toReportSummary(report) }, { status: 201 });
}
