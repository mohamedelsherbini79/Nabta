import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { updateUserCountry } from "@/lib/settings";
import { updateCountrySchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateCountrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const updated = await updateUserCountry(user.id, parsed.data.preferredCountry);
  await logAudit({ actorUserId: user.id, action: "SETTINGS_COUNTRY_UPDATE", entityType: "User", entityId: user.id });

  return NextResponse.json({ preferredCountry: updated.preferredCountry });
}
