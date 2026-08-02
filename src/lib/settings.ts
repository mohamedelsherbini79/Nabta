import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { Locale } from "@/i18n/locale";
import type { CountryCode } from "@/country/country";

export async function updateUserProfile(
  userId: string,
  data: { name: string; phone?: string },
): Promise<{ ok: true; user: { name: string | null; phone: string | null } } | { ok: false; error: string }> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: data.name, phone: data.phone ? data.phone : data.phone === "" ? null : undefined },
    });
    return { ok: true, user: { name: user.name, phone: user.phone } };
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return { ok: false, error: "This phone number is already in use." };
    }
    throw err;
  }
}

export function updateUserLocale(userId: string, preferredLocale: Locale) {
  return prisma.user.update({ where: { id: userId }, data: { preferredLocale } });
}

export function updateUserCountry(userId: string, preferredCountry: CountryCode) {
  return prisma.user.update({ where: { id: userId }, data: { preferredCountry } });
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { ok: false, error: "User not found." };
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return { ok: true };
}
