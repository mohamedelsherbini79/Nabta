// Single source of truth for mood-level display/scoring, shared by the
// server-side lib (mentalHealth.ts) and client components (MoodEntryForm,
// MoodEntryList, MoodTrendChart) — pure, no prisma import, so client
// components can import it directly.

import type { MoodLevel } from "@/types";

export const MOOD_EMOJI: Record<MoodLevel, string> = {
  TERRIBLE: "😞",
  BAD: "🙁",
  NEUTRAL: "😐",
  GOOD: "🙂",
  EXCELLENT: "😄",
};

export const MOOD_OPTIONS: { value: MoodLevel; emoji: string }[] = (
  Object.keys(MOOD_EMOJI) as MoodLevel[]
).map((value) => ({ value, emoji: MOOD_EMOJI[value] }));

const MOOD_SCORES: Record<MoodLevel, number> = {
  TERRIBLE: 1,
  BAD: 2,
  NEUTRAL: 3,
  GOOD: 4,
  EXCELLENT: 5,
};

export function moodScore(mood: string): number {
  return MOOD_SCORES[mood as MoodLevel] ?? 3;
}
