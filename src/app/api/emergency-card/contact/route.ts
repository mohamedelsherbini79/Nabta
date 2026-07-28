import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { updateEmergencyContact } from "@/lib/emergencyCard";
import { emergencyContactSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = emergencyContactSchema.safeParse(body);
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

  const profile = await updateEmergencyContact(
    patientProfileId,
    parsed.data.emergencyContactName ?? null,
    parsed.data.emergencyContactPhone ?? null,
  );
  await logAudit({ actorUserId: user.id, action: "EMERGENCY_CONTACT_UPDATE", entityType: "PatientProfile", entityId: patientProfileId });

  return NextResponse.json({
    emergencyContactName: profile.emergencyContactName,
    emergencyContactPhone: profile.emergencyContactPhone,
  });
}
