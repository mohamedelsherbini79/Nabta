import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getAvailableSlots } from "@/lib/consultations";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const doctorUserId = searchParams.get("doctorUserId");
  if (!doctorUserId) {
    return NextResponse.json({ error: "invalid_input", message: "doctorUserId is required." }, { status: 400 });
  }

  const slots = await getAvailableSlots(doctorUserId);
  return NextResponse.json({ slots: slots.map((s) => s.toISOString()) });
}
