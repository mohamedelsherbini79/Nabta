import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getAllReportsAdmin, toAdminReportSummary } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden", message: "Admin access required." }, { status: 403 });
  }

  const reports = await getAllReportsAdmin();
  return NextResponse.json({ reports: reports.map(toAdminReportSummary) });
}
