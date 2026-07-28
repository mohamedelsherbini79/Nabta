import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function logAudit(params: {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId ?? undefined,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? undefined,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
      ipAddress: params.ipAddress ?? undefined,
    },
  });
}
