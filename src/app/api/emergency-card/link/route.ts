import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { createEmergencyCardLink, toEmergencyCardLinkSummary } from "@/lib/emergencyCard";
import { emergencyCardScopeSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = emergencyCardScopeSchema.safeParse(body?.scope ?? {});
  const patientProfileId: string | undefined = body?.patientProfileId;
  if (!parsed.success || !patientProfileId) {
    return NextResponse.json(
      {
        error: "invalid_input",
        message: parsed.success ? "patientProfileId is required." : (parsed.error.issues[0]?.message ?? "Invalid input"),
      },
      { status: 400 },
    );
  }

  const allowed = await canAccessProfile(user.id, patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  const link = await createEmergencyCardLink(patientProfileId, user.id, parsed.data);
  await logAudit({ actorUserId: user.id, action: "EMERGENCY_CARD_LINK_CREATE", entityType: "QrShareLink", entityId: link.id });

  return NextResponse.json({ link: toEmergencyCardLinkSummary(link) }, { status: 201 });
}
