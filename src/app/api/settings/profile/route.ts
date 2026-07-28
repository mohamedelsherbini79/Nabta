import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { updateUserProfile } from "@/lib/settings";
import { updateProfileSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const result = await updateUserProfile(user.id, parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: "conflict", message: result.error }, { status: 409 });
  }

  await logAudit({ actorUserId: user.id, action: "SETTINGS_PROFILE_UPDATE", entityType: "User", entityId: user.id });

  return NextResponse.json({ name: result.user.name, phone: result.user.phone });
}
