import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { deleteMoodEntry } from "@/lib/mentalHealth";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const entry = await prisma.moodEntry.findUnique({ where: { id } });
  if (!entry) {
    return NextResponse.json({ error: "not_found", message: "Mood entry not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, entry.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Mood entry not found." }, { status: 404 });
  }

  await deleteMoodEntry(id);
  await logAudit({ actorUserId: user.id, action: "MOOD_ENTRY_DELETE", entityType: "MoodEntry", entityId: id });

  return NextResponse.json({ success: true });
}
