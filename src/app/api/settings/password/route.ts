import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { changeUserPassword } from "@/lib/settings";
import { changePasswordSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const result = await changeUserPassword(user.id, parsed.data.currentPassword, parsed.data.newPassword);
  if (!result.ok) {
    return NextResponse.json({ error: "invalid_password", message: result.error }, { status: 400 });
  }

  await logAudit({ actorUserId: user.id, action: "SETTINGS_PASSWORD_CHANGE", entityType: "User", entityId: user.id });

  return NextResponse.json({ success: true });
}
