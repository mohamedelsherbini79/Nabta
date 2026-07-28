import { prisma } from "@/lib/prisma";
import type { CommunityCommentInput, CommunityPostInput } from "@/lib/validation";
import type { CommunityAuthorSummary, CommunityCommentSummary, CommunityGroupSummary, CommunityPostSummary } from "@/types";

export async function getGroupsWithMembership(userId: string) {
  const groups = await prisma.communityGroup.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { memberships: true } } },
  });
  const memberships = await prisma.communityMembership.findMany({ where: { userId } });
  const memberGroupIds = new Set(memberships.map((m) => m.groupId));

  return groups.map((g) => ({
    id: g.id,
    slug: g.slug,
    name: g.name,
    conditionTag: g.conditionTag,
    memberCount: g._count.memberships,
    isMember: memberGroupIds.has(g.id),
  })) satisfies CommunityGroupSummary[];
}

export function getGroupById(id: string) {
  return prisma.communityGroup.findUnique({ where: { id } });
}

export function getMembership(groupId: string, userId: string) {
  return prisma.communityMembership.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
}

export function joinGroup(groupId: string, userId: string) {
  return prisma.communityMembership.create({ data: { groupId, userId } });
}

export function leaveGroup(groupId: string, userId: string) {
  return prisma.communityMembership.delete({
    where: { groupId_userId: { groupId, userId } },
  });
}

export function getPostsForGroup(groupId: string) {
  return prisma.communityPost.findMany({
    where: { groupId, status: "VISIBLE" },
    include: { author: { select: { id: true, name: true } }, _count: { select: { comments: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function createPost(groupId: string, authorId: string, input: CommunityPostInput) {
  return prisma.communityPost.create({
    data: { groupId, authorId, content: input.content },
    include: { author: { select: { id: true, name: true } }, _count: { select: { comments: true } } },
  });
}

export function getPostById(id: string) {
  return prisma.communityPost.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } }, _count: { select: { comments: true } } },
  });
}

export function getCommentsForPost(postId: string) {
  return prisma.communityComment.findMany({
    where: { postId, status: "VISIBLE" },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export function createComment(postId: string, authorId: string, input: CommunityCommentInput) {
  return prisma.communityComment.create({
    data: { postId, authorId, content: input.content },
    include: { author: { select: { id: true, name: true } } },
  });
}

export function deletePost(id: string) {
  return prisma.communityPost.delete({ where: { id } });
}

export function deleteComment(id: string) {
  return prisma.communityComment.delete({ where: { id } });
}

interface PostForSummary {
  id: string;
  groupId: string;
  author: CommunityAuthorSummary;
  content: string;
  createdAt: Date;
  _count: { comments: number };
}

export function toCommunityPostSummary(post: PostForSummary): CommunityPostSummary {
  return {
    id: post.id,
    groupId: post.groupId,
    author: post.author,
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    commentCount: post._count.comments,
  };
}

interface CommentForSummary {
  id: string;
  postId: string;
  author: CommunityAuthorSummary;
  content: string;
  createdAt: Date;
}

export function toCommunityCommentSummary(comment: CommentForSummary): CommunityCommentSummary {
  return {
    id: comment.id,
    postId: comment.postId,
    author: comment.author,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
  };
}
