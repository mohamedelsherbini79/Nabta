import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { prisma } from "@/lib/prisma";
import { ensureVideoRoom, getConsultationById } from "@/lib/consultations";
import { videoRoomProvider, VideoGatewayNotConfiguredError } from "@/lib/video";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const consultation = await getConsultationById(id);
  if (!consultation) {
    return NextResponse.json({ error: "not_found", message: "Consultation not found." }, { status: 404 });
  }

  const isDoctor = user.role === "DOCTOR" && consultation.doctorUserId === user.id;
  let userName: string;

  if (isDoctor) {
    userName = user.name ?? "Doctor";
  } else {
    const allowed = await canAccessProfile(user.id, consultation.patientProfileId);
    if (!allowed) {
      return NextResponse.json({ error: "not_found", message: "Consultation not found." }, { status: 404 });
    }
    const profile = await prisma.patientProfile.findUnique({ where: { id: consultation.patientProfileId } });
    userName = profile?.displayName ?? "Patient";
  }

  if (consultation.status !== "BOOKED") {
    return NextResponse.json({ error: "invalid_state", message: "This consultation is not joinable." }, { status: 400 });
  }

  try {
    const room = await ensureVideoRoom(consultation);
    const { token } = await videoRoomProvider.createMeetingToken(room.roomName, userName, isDoctor);
    return NextResponse.json({ roomUrl: room.roomUrl, token });
  } catch (err) {
    if (err instanceof VideoGatewayNotConfiguredError) {
      return NextResponse.json(
        { error: "gateway_not_configured", message: "Video calling is not configured yet." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "gateway_error", message: "Could not start the call. Please try again." }, { status: 502 });
  }
}
