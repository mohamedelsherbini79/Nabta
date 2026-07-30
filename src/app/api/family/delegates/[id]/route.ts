import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isFamilyHead, revokeDelegate } from "@/lib/family";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const delegate = await prisma.familyDelegate.findUnique({ where: { id } });
  if (!delegate) {
    return NextResponse.json({ error: "not_found", message: "Delegate not found." }, { status: 404 });
  }

  const allowed = await isFamilyHead(user.id, delegate.familyGroupId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Delegate not found." }, { status: 404 });
  }

  await revokeDelegate(id);

  await logAudit({
    actorUserId: user.id,
    action: "FAMILY_DELEGATE_REVOKE",
    entityType: "FamilyDelegate",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
