import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { deleteCycleEntry, markCycleEnded } from "@/lib/cycle";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const entry = await prisma.menstrualCycleEntry.findUnique({ where: { id } });
  if (!entry) {
    return NextResponse.json({ error: "not_found", message: "Cycle entry not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, entry.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Cycle entry not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const endDate = body?.endDate ? new Date(body.endDate) : new Date();
  if (Number.isNaN(endDate.getTime())) {
    return NextResponse.json({ error: "invalid_input", message: "Invalid end date." }, { status: 400 });
  }
  if (endDate < entry.startDate) {
    return NextResponse.json(
      { error: "invalid_input", message: "End date cannot be before the start date." },
      { status: 400 },
    );
  }

  const updated = await markCycleEnded(id, endDate);
  await logAudit({ actorUserId: user.id, action: "CYCLE_ENTRY_UPDATE", entityType: "MenstrualCycleEntry", entityId: id });

  return NextResponse.json({ entry: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const entry = await prisma.menstrualCycleEntry.findUnique({ where: { id } });
  if (!entry) {
    return NextResponse.json({ error: "not_found", message: "Cycle entry not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, entry.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Cycle entry not found." }, { status: 404 });
  }

  await deleteCycleEntry(id);
  await logAudit({ actorUserId: user.id, action: "CYCLE_ENTRY_DELETE", entityType: "MenstrualCycleEntry", entityId: id });

  return NextResponse.json({ success: true });
}
