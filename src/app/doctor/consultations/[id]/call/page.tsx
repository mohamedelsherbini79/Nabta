import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getConsultationById } from "@/lib/consultations";
import { prisma } from "@/lib/prisma";
import { CallScreen } from "@/components/consultations/CallScreen";

export default async function DoctorConsultationCallPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;

  const { id } = await params;
  const consultation = await getConsultationById(id);
  if (!consultation || consultation.doctorUserId !== user.id) notFound();

  const patientProfile = await prisma.patientProfile.findUnique({ where: { id: consultation.patientProfileId } });

  return (
    <CallScreen
      consultationId={id}
      otherPartyLabel={patientProfile?.displayName ?? "—"}
      backHref="/doctor/consultations"
    />
  );
}
