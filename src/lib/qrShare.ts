import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export function generateShareToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export async function verifyShareToken(token: string) {
  const link = await prisma.qrShareLink.findUnique({ where: { token } });
  if (!link) return null;
  if (link.revokedAt) return null;
  if (link.expiresAt && link.expiresAt < new Date()) return null;
  return link;
}
