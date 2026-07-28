import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { updateUserLocale } from "@/lib/settings";
import { updateLocaleSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateLocaleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const updated = await updateUserLocale(user.id, parsed.data.preferredLocale);
  await logAudit({ actorUserId: user.id, action: "SETTINGS_LOCALE_UPDATE", entityType: "User", entityId: user.id });

  return NextResponse.json({ preferredLocale: updated.preferredLocale });
}
