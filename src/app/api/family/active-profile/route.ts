import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { ACTIVE_PROFILE_COOKIE, canAccessProfile } from "@/lib/family";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const patientProfileId: string | undefined = body?.patientProfileId;
  if (!patientProfileId) {
    return NextResponse.json({ error: "invalid_input", message: "patientProfileId is required." }, { status: 400 });
  }

  const allowed = await canAccessProfile(user.id, patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(ACTIVE_PROFILE_COOKIE, patientProfileId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
