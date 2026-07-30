import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/generated/prisma/client";

const MOBILE_TOKEN_TTL = "30d";
const ISSUER = "ai-consultation-platform:mobile";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export interface MobileTokenPayload {
  sub: string;
  email: string;
  name: string | null;
  role: Role;
}

export async function signMobileToken(payload: MobileTokenPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(MOBILE_TOKEN_TTL)
    .setIssuer(ISSUER)
    .sign(secretKey());
}

export async function verifyMobileToken(token: string): Promise<MobileTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: ISSUER });
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.role !== "string") return null;
    return {
      sub: payload.sub,
      email: payload.email,
      name: (payload.name as string) ?? null,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}
