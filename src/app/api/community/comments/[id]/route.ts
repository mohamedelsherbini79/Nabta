import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { deleteComment } from "@/lib/community";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const comment = await prisma.communityComment.findUnique({ where: { id } });
  if (!comment) {
    return NextResponse.json({ error: "not_found", message: "Comment not found." }, { status: 404 });
  }

  if (comment.authorId !== user.id) {
    return NextResponse.json({ error: "forbidden", message: "You can only delete your own comments." }, { status: 403 });
  }

  await deleteComment(id);
  await logAudit({ actorUserId: user.id, action: "COMMUNITY_COMMENT_DELETE", entityType: "CommunityComment", entityId: id });

  return NextResponse.json({ success: true });
}
