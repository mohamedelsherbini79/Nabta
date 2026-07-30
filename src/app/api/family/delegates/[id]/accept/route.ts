import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/session";
import { acceptDelegateInvite } from "@/lib/family";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const delegate = await acceptDelegateInvite(id, user.id);
  if (!delegate) {
    return NextResponse.json({ error: "not_found", message: "Invite not found." }, { status: 404 });
  }

  await logAudit({
    actorUserId: user.id,
    action: "FAMILY_DELEGATE_ACCEPT",
    entityType: "FamilyDelegate",
    entityId: id,
  });

  return NextResponse.json({ delegate });
}
