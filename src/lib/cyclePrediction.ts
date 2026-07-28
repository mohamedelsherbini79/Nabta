// Pure, client-safe cycle prediction math — deliberately kept out of
// src/lib/cycle.ts (which imports prisma) so client components can import
// this without dragging in the Prisma/pg module graph. Same reasoning as
// src/lib/bmi.ts and src/lib/vitalsRange.ts.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface CyclePrediction {
  hasPrediction: boolean;
  avgCycleLengthDays: number | null;
  avgPeriodLengthDays: number | null;
  predictedNextStart: string | null;
  fertileWindowStart: string | null;
  fertileWindowEnd: string | null;
  currentCycleDay: number | null;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function predictNextCycle(
  entries: { startDate: Date; endDate: Date | null }[],
): CyclePrediction {
  if (entries.length === 0) {
    return {
      hasPrediction: false,
      avgCycleLengthDays: null,
      avgPeriodLengthDays: null,
      predictedNextStart: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      currentCycleDay: null,
    };
  }

  const sorted = [...entries].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const lastStart = sorted[sorted.length - 1].startDate;
  const currentCycleDay = daysBetween(lastStart, new Date()) + 1;

  const periodLengths = sorted
    .filter((e) => e.endDate !== null)
    .map((e) => daysBetween(e.startDate, e.endDate as Date));
  const avgPeriodLengthDays =
    periodLengths.length > 0
      ? Math.round(periodLengths.reduce((sum, n) => sum + n, 0) / periodLengths.length)
      : null;

  if (sorted.length < 2) {
    return {
      hasPrediction: false,
      avgCycleLengthDays: null,
      avgPeriodLengthDays,
      predictedNextStart: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      currentCycleDay,
    };
  }

  const cycleLengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    cycleLengths.push(daysBetween(sorted[i - 1].startDate, sorted[i].startDate));
  }
  const avgCycleLengthDays = Math.round(
    cycleLengths.reduce((sum, n) => sum + n, 0) / cycleLengths.length,
  );

  const predictedNextStart = addDays(lastStart, avgCycleLengthDays);
  const ovulationDate = addDays(predictedNextStart, -14);
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = addDays(ovulationDate, 1);

  return {
    hasPrediction: true,
    avgCycleLengthDays,
    avgPeriodLengthDays,
    predictedNextStart: predictedNextStart.toISOString().slice(0, 10),
    fertileWindowStart: fertileWindowStart.toISOString().slice(0, 10),
    fertileWindowEnd: fertileWindowEnd.toISOString().slice(0, 10),
    currentCycleDay,
  };
}
