import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { createPost, getMembership, getPostsForGroup, toCommunityPostSummary } from "@/lib/community";
import { communityPostSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const membership = await getMembership(id, user.id);
  if (!membership) {
    return NextResponse.json({ error: "forbidden", message: "Join this group to view posts." }, { status: 403 });
  }

  const posts = await getPostsForGroup(id);
  return NextResponse.json({ posts: posts.map(toCommunityPostSummary) });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const membership = await getMembership(id, user.id);
  if (!membership) {
    return NextResponse.json({ error: "forbidden", message: "Join this group to post." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = communityPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const post = await createPost(id, user.id, parsed.data);
  await logAudit({ actorUserId: user.id, action: "COMMUNITY_POST_CREATE", entityType: "CommunityPost", entityId: post.id });

  return NextResponse.json({ post: toCommunityPostSummary(post) }, { status: 201 });
}
