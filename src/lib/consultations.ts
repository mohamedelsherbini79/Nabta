import { prisma } from "@/lib/prisma";
import { videoRoomProvider, type VideoRoom } from "@/lib/video";
import type { CountryCode } from "@/country/country";
import type { ConsultationSummary, ConsultationStatus, DoctorConsultationSummary, DoctorSummary } from "@/types";

const SLOT_START_HOUR = 9;
const SLOT_END_HOUR = 16; // last bookable start time (slot runs 4-5pm)
const WEEKEND_DAYS = [5, 6]; // Friday, Saturday — regional weekend

export function getDemoDoctors(country: CountryCode) {
  return prisma.user.findMany({ where: { role: "DOCTOR", practicingCountry: country }, orderBy: { name: "asc" } });
}

export async function getConsultationsForProfile(patientProfileId: string) {
  const consultations = await prisma.consultation.findMany({
    where: { patientProfileId },
    orderBy: { scheduledFor: "desc" },
  });

  const doctorIds = Array.from(new Set(consultations.map((c) => c.doctorUserId)));
  const doctors = doctorIds.length > 0 ? await prisma.user.findMany({ where: { id: { in: doctorIds } } }) : [];
  const doctorById = new Map(doctors.map((d) => [d.id, d]));

  return consultations.map((c) => ({ ...c, doctor: doctorById.get(c.doctorUserId) ?? null }));
}

export async function getAvailableSlots(doctorUserId: string, days = 7): Promise<Date[]> {
  const now = new Date();
  const candidateDays: Date[] = [];
  let offset = 1;
  while (candidateDays.length < days) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    if (!WEEKEND_DAYS.includes(day.getDay())) {
      candidateDays.push(day);
    }
    offset++;
  }

  const allSlots: Date[] = [];
  for (const day of candidateDays) {
    for (let hour = SLOT_START_HOUR; hour <= SLOT_END_HOUR; hour++) {
      allSlots.push(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0));
    }
  }

  const windowStart = candidateDays[0];
  const windowEnd = new Date(candidateDays[candidateDays.length - 1].getTime() + 24 * 60 * 60 * 1000);

  const booked = await prisma.consultation.findMany({
    where: { doctorUserId, status: "BOOKED", scheduledFor: { gte: windowStart, lt: windowEnd } },
    select: { scheduledFor: true },
  });
  const bookedTimes = new Set(booked.map((b) => b.scheduledFor.getTime()));

  return allSlots.filter((slot) => !bookedTimes.has(slot.getTime()));
}

export async function createConsultation(patientProfileId: string, doctorUserId: string, scheduledFor: Date) {
  const conflict = await prisma.consultation.findFirst({
    where: { doctorUserId, scheduledFor, status: "BOOKED" },
  });
  if (conflict) return null;

  return prisma.consultation.create({
    data: { patientProfileId, doctorUserId, scheduledFor, status: "BOOKED" },
  });
}

export function cancelConsultation(id: string) {
  return prisma.consultation.update({ where: { id }, data: { status: "CANCELLED" } });
}

export function markConsultationCompleted(id: string) {
  return prisma.consultation.update({ where: { id }, data: { status: "COMPLETED" } });
}

export function markConsultationNoShow(id: string) {
  return prisma.consultation.update({ where: { id }, data: { status: "NO_SHOW" } });
}

export function getConsultationById(id: string) {
  return prisma.consultation.findUnique({ where: { id } });
}

export function getConsultationsForDoctor(doctorUserId: string) {
  return prisma.consultation.findMany({
    where: { doctorUserId },
    include: { patientProfile: true },
    orderBy: { scheduledFor: "desc" },
  });
}

// Idempotent: creates a Daily.co room on first join and persists its name to
// videoRoomRef, so whichever party (patient or doctor) joins first creates
// the room and the other side reuses it.
export async function ensureVideoRoom(consultation: { id: string; videoRoomRef: string | null }): Promise<VideoRoom> {
  if (consultation.videoRoomRef) {
    return { roomName: consultation.videoRoomRef, roomUrl: videoRoomProvider.roomUrlFromName(consultation.videoRoomRef) };
  }

  const room = await videoRoomProvider.createRoom(consultation.id);
  await prisma.consultation.update({ where: { id: consultation.id }, data: { videoRoomRef: room.roomName } });
  return room;
}

interface DoctorForSummary {
  id: string;
  name: string | null;
  specialty: string | null;
}

export function toDoctorSummary(doctor: DoctorForSummary): DoctorSummary {
  return { id: doctor.id, name: doctor.name, specialty: doctor.specialty };
}

interface ConsultationForSummary {
  id: string;
  scheduledFor: Date;
  status: string;
  doctor: DoctorForSummary | null;
}

export function toConsultationSummary(consultation: ConsultationForSummary): ConsultationSummary {
  return {
    id: consultation.id,
    scheduledFor: consultation.scheduledFor.toISOString(),
    status: consultation.status as ConsultationStatus,
    doctor: consultation.doctor ? toDoctorSummary(consultation.doctor) : null,
  };
}

interface ConsultationForDoctorSummary {
  id: string;
  scheduledFor: Date;
  status: string;
  patientProfile: { displayName: string };
}

export function toDoctorConsultationSummary(consultation: ConsultationForDoctorSummary): DoctorConsultationSummary {
  return {
    id: consultation.id,
    scheduledFor: consultation.scheduledFor.toISOString(),
    status: consultation.status as ConsultationStatus,
    patientDisplayName: consultation.patientProfile.displayName,
  };
}
