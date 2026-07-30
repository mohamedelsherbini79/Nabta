import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { verifyMobileToken } from "@/lib/mobileAuth";
import type { Role } from "@/generated/prisma/client";

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

// Bearer-token variant for the mobile client, which can't participate in
// Auth.js's cookie-based session flow. Falls back to the normal cookie
// session so existing web call sites keep working unchanged.
export async function getSessionUserFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const payload = await verifyMobileToken(authHeader.slice(7));
    return payload ? { id: payload.sub, email: payload.email, name: payload.name, role: payload.role } : null;
  }
  return getSessionUser();
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(allowed: Role[]) {
  const user = await requireUser();
  if (!allowed.includes(user.role)) {
    notFound();
  }
  return user;
}
