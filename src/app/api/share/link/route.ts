import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { createDoctorShareLink, toDoctorShareLinkSummary } from "@/lib/doctorShare";
import { doctorShareScopeSchema, shareLinkDurationSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const scopeParsed = doctorShareScopeSchema.safeParse(body?.scope ?? {});
  const durationParsed = shareLinkDurationSchema.safeParse(body?.expiresInHours);
  const patientProfileId: string | undefined = body?.patientProfileId;

  if (!patientProfileId) {
    return NextResponse.json({ error: "invalid_input", message: "patientProfileId is required." }, { status: 400 });
  }
  if (!scopeParsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: scopeParsed.error.issues[0]?.message ?? "Invalid scope" },
      { status: 400 },
    );
  }
  if (!durationParsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: durationParsed.error.issues[0]?.message ?? "Invalid duration" },
      { status: 400 },
    );
  }

  const allowed = await canAccessProfile(user.id, patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  const link = await createDoctorShareLink(patientProfileId, user.id, {
    scope: scopeParsed.data,
    expiresInHours: durationParsed.data,
  });
  await logAudit({ actorUserId: user.id, action: "DOCTOR_SHARE_LINK_CREATE", entityType: "QrShareLink", entityId: link.id });

  return NextResponse.json({ link: toDoctorShareLinkSummary(link) }, { status: 201 });
}
