import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/loyalty";
import type { MoodEntryInput } from "@/lib/validation";
import type { MoodEntrySummary } from "@/types";

interface MoodEntryRow {
  id: string;
  mood: string;
  sleepHours: number | null;
  stressLevel: number | null;
  note: string | null;
  loggedAt: Date;
}

export function getMoodEntries(patientProfileId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return prisma.moodEntry.findMany({
    where: { patientProfileId, loggedAt: { gte: since } },
    orderBy: { loggedAt: "desc" },
  });
}

export async function createMoodEntry(patientProfileId: string, input: MoodEntryInput) {
  const entry = await prisma.moodEntry.create({
    data: {
      patientProfileId,
      mood: input.mood,
      sleepHours: input.sleepHours ?? null,
      stressLevel: input.stressLevel ?? null,
      note: input.note ?? null,
      loggedAt: input.loggedAt ?? new Date(),
    },
  });
  await awardPoints(patientProfileId, 5, "MOOD_LOGGED");
  return entry;
}

export function deleteMoodEntry(id: string) {
  return prisma.moodEntry.delete({ where: { id } });
}

export function toMoodEntrySummary(entry: MoodEntryRow): MoodEntrySummary {
  return {
    id: entry.id,
    mood: entry.mood as MoodEntrySummary["mood"],
    sleepHours: entry.sleepHours,
    stressLevel: entry.stressLevel,
    note: entry.note,
    loggedAt: entry.loggedAt.toISOString(),
  };
}

const MOOD_SCORES: Record<string, number> = {
  TERRIBLE: 1,
  BAD: 2,
  NEUTRAL: 3,
  GOOD: 4,
  EXCELLENT: 5,
};

export function moodScore(mood: string): number {
  return MOOD_SCORES[mood] ?? 3;
}
