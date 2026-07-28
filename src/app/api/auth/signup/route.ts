import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signupSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "email_taken", message: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true },
    });

    const familyGroup = await tx.familyGroup.create({
      data: { headUserId: createdUser.id },
    });

    await tx.patientProfile.create({
      data: {
        familyGroupId: familyGroup.id,
        userId: createdUser.id,
        relationship: "SELF",
        displayName: createdUser.name ?? createdUser.email,
      },
    });

    return createdUser;
  });

  return NextResponse.json({ user }, { status: 201 });
}
