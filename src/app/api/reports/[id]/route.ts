import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { deleteReport, getReportById } from "@/lib/reports";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const report = await getReportById(id);
  if (!report) {
    return NextResponse.json({ error: "not_found", message: "Report not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, report.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Report not found." }, { status: 404 });
  }

  await deleteReport(id);
  await logAudit({ actorUserId: user.id, action: "REPORT_DELETE", entityType: "MonthlyReport", entityId: id });

  return NextResponse.json({ success: true });
}
