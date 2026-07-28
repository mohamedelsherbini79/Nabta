import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { createComment, getCommentsForPost, getMembership, getPostById, toCommunityCommentSummary } from "@/lib/community";
import { communityCommentSchema } from "@/lib/validation";

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
    return NextResponse.json({ error: "forbidden", message: "Join this group to view comments." }, { status: 403 });
  }

  const comments = await getCommentsForPost(id);
  return NextResponse.json({ comments: comments.map(toCommunityCommentSummary) });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    return NextResponse.json({ error: "forbidden", message: "Join this group to comment." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = communityCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const comment = await createComment(id, user.id, parsed.data);
  await logAudit({ actorUserId: user.id, action: "COMMUNITY_COMMENT_CREATE", entityType: "CommunityComment", entityId: comment.id });

  return NextResponse.json({ comment: toCommunityCommentSummary(comment) }, { status: 201 });
}
