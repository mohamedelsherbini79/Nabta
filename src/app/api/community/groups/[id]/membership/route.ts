import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { getGroupById, getMembership, joinGroup, leaveGroup } from "@/lib/community";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const group = await getGroupById(id);
  if (!group) {
    return NextResponse.json({ error: "not_found", message: "Group not found." }, { status: 404 });
  }

  const existing = await getMembership(id, user.id);
  if (existing) {
    return NextResponse.json({ membership: existing });
  }

  const membership = await joinGroup(id, user.id);
  await logAudit({ actorUserId: user.id, action: "COMMUNITY_GROUP_JOIN", entityType: "CommunityGroup", entityId: id });

  return NextResponse.json({ membership }, { status: 201 });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getMembership(id, user.id);
  if (!existing) {
    return NextResponse.json({ error: "not_found", message: "Not a member of this group." }, { status: 404 });
  }

  await leaveGroup(id, user.id);
  await logAudit({ actorUserId: user.id, action: "COMMUNITY_GROUP_LEAVE", entityType: "CommunityGroup", entityId: id });

  return NextResponse.json({ success: true });
}
