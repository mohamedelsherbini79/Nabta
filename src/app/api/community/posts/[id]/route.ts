import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { deletePost, getMembership, getPostById, toCommunityPostSummary } from "@/lib/community";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const post = await getPostById(id);
  if (!post) {
    return NextResponse.json({ error: "not_found", message: "Post not found." }, { status: 404 });
  }

  const membership = await getMembership(post.groupId, user.id);
  if (!membership) {
    return NextResponse.json({ error: "forbidden", message: "Join this group to view this post." }, { status: 403 });
  }

  return NextResponse.json({ post: toCommunityPostSummary(post) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const post = await getPostById(id);
  if (!post) {
    return NextResponse.json({ error: "not_found", message: "Post not found." }, { status: 404 });
  }

  if (post.authorId !== user.id) {
    return NextResponse.json({ error: "forbidden", message: "You can only delete your own posts." }, { status: 403 });
  }

  await deletePost(id);
  await logAudit({ actorUserId: user.id, action: "COMMUNITY_POST_DELETE", entityType: "CommunityPost", entityId: id });

  return NextResponse.json({ success: true });
}
