import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { getConsultationById } from "@/lib/consultations";
import { prisma } from "@/lib/prisma";
import { CallScreen } from "@/components/consultations/CallScreen";

export default async function ConsultationCallPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;

  const { id } = await params;
  const consultation = await getConsultationById(id);
  if (!consultation) notFound();

  const allowed = await canAccessProfile(user.id, consultation.patientProfileId);
  if (!allowed) notFound();

  const doctor = await prisma.user.findUnique({ where: { id: consultation.doctorUserId } });
  const doctorLabel = doctor ? (doctor.specialty ? `${doctor.name} — ${doctor.specialty}` : (doctor.name ?? "—")) : "—";

  return <CallScreen consultationId={id} otherPartyLabel={doctorLabel} backHref="/consultations" />;
}
