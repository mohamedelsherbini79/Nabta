import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getAllConsultationsAdmin, toAdminConsultationSummary } from "@/lib/admin";
import type { ConsultationStatus } from "@/types";

export const runtime = "nodejs";

const VALID_STATUSES: ConsultationStatus[] = ["BOOKED", "COMPLETED", "CANCELLED", "NO_SHOW"];

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden", message: "Admin access required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const status = VALID_STATUSES.includes(statusParam as ConsultationStatus) ? (statusParam as ConsultationStatus) : undefined;

  const consultations = await getAllConsultationsAdmin(status);
  return NextResponse.json({ consultations: consultations.map(toAdminConsultationSummary) });
}
