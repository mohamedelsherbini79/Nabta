import { prisma } from "@/lib/prisma";

export const DOSE_WINDOW_DAYS = 14;
const OVERDUE_GRACE_HOURS = 3;

// Converts a local wall-clock "HH:MM" on a given calendar date + IANA
// timezone into the correct UTC Date, using only Intl (no date-tz library).
function zonedTimeToUtc(dateISO: string, hhmm: string, timeZone: string): Date {
  const [year, month, day] = dateISO.split("-").map(Number);
  const [hour, minute] = hhmm.split(":").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, string> = {};
  for (const part of dtf.formatToParts(utcGuess)) map[part.type] = part.value;

  const asUtcIfLocal = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour) === 24 ? 0 : Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );

  const offset = utcGuess.getTime() - asUtcIfLocal;
  return new Date(utcGuess.getTime() + offset);
}

function toDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export async function topUpDoseWindow(scheduleId: string): Promise<void> {
  const schedule = await prisma.medicationSchedule.findUnique({
    where: { id: scheduleId },
    include: { medication: true },
  });
  if (!schedule || !schedule.active) return;

  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const rangeStart =
    schedule.medication.startDate > todayUTC ? schedule.medication.startDate : todayUTC;
  const windowEnd = addDays(todayUTC, DOSE_WINDOW_DAYS);
  const rangeEnd =
    schedule.medication.endDate && schedule.medication.endDate < windowEnd
      ? schedule.medication.endDate
      : windowEnd;

  if (rangeStart > rangeEnd) return;

  const existing = await prisma.dose.findMany({
    where: {
      medicationScheduleId: scheduleId,
      scheduledFor: { gte: rangeStart, lte: rangeEnd },
    },
    select: { scheduledFor: true },
  });
  const existingKeys = new Set(existing.map((d) => d.scheduledFor.toISOString()));

  const toCreate: { medicationScheduleId: string; scheduledFor: Date }[] = [];
  for (let day = new Date(rangeStart); day <= rangeEnd; day = addDays(day, 1)) {
    const dayOfWeek = day.getUTCDay();
    if (schedule.daysOfWeek.length > 0 && !schedule.daysOfWeek.includes(dayOfWeek)) continue;

    const dateISO = toDateISO(day);
    for (const hhmm of schedule.timesOfDay) {
      const scheduledFor = zonedTimeToUtc(dateISO, hhmm, schedule.timezone);
      if (scheduledFor < rangeStart || scheduledFor > rangeEnd) continue;
      const key = scheduledFor.toISOString();
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);
      toCreate.push({ medicationScheduleId: scheduleId, scheduledFor });
    }
  }

  if (toCreate.length > 0) {
    await prisma.dose.createMany({ data: toCreate });
  }
}

export async function markOverduePendingAsMissed(patientProfileId: string): Promise<void> {
  const cutoff = new Date(Date.now() - OVERDUE_GRACE_HOURS * 60 * 60 * 1000);
  await prisma.dose.updateMany({
    where: {
      status: "PENDING",
      scheduledFor: { lt: cutoff },
      schedule: { medication: { patientProfileId } },
    },
    data: { status: "MISSED", actedAt: new Date() },
  });
}

// Acts as the "cron substitute" for this dev environment — called from every
// medications/doses read so the rolling window silently extends and overdue
// doses get swept, without a real background job.
export async function topUpAllSchedulesForProfile(patientProfileId: string): Promise<void> {
  const schedules = await prisma.medicationSchedule.findMany({
    where: { active: true, medication: { patientProfileId } },
    select: { id: true },
  });

  for (const s of schedules) {
    await topUpDoseWindow(s.id);
  }
  await markOverduePendingAsMissed(patientProfileId);
}
