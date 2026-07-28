import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/client";

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
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
