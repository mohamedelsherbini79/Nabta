import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { revokeEmergencyCardLink } from "@/lib/emergencyCard";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const link = await prisma.qrShareLink.findUnique({ where: { id } });
  if (!link) {
    return NextResponse.json({ error: "not_found", message: "Link not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, link.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Link not found." }, { status: 404 });
  }

  await revokeEmergencyCardLink(id);
  await logAudit({ actorUserId: user.id, action: "EMERGENCY_CARD_LINK_REVOKE", entityType: "QrShareLink", entityId: id });

  return NextResponse.json({ success: true });
}
