import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export interface HealthScoreBreakdown {
  adherence: number; // 0-100
  assessment: number; // 0-100
  vitals: number; // 0-100
  activity: number; // 0-100
}

const WEIGHTS = { adherence: 0.4, assessment: 0.2, vitals: 0.2, activity: 0.2 };
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export async function computeHealthScore(
  patientProfileId: string,
): Promise<{ score: number; breakdown: HealthScoreBreakdown }> {
  const since = new Date(Date.now() - WINDOW_MS);

  const doses = await prisma.dose.findMany({
    where: {
      schedule: { medication: { patientProfileId } },
      scheduledFor: { gte: since },
    },
    select: { status: true },
  });
  const takenCount = doses.filter((d) => d.status === "TAKEN").length;
  const adherence = doses.length > 0 ? Math.round((takenCount / doses.length) * 100) : 100;

  const hasAssessment = (await prisma.selfAssessment.count({ where: { patientProfileId } })) > 0;
  const assessment = hasAssessment ? 100 : 0;

  const hasRecentVitals =
    (await prisma.vitalsRecord.count({ where: { patientProfileId, recordedAt: { gte: since } } })) > 0;
  const vitals = hasRecentVitals ? 100 : 0;

  const hasRecentActivity =
    (await prisma.wearableSample.count({
      where: { wearableConnection: { patientProfileId }, recordedAt: { gte: since } },
    })) > 0;
  const activity = hasRecentActivity ? 100 : 0;

  const breakdown: HealthScoreBreakdown = { adherence, assessment, vitals, activity };
  const score = Math.round(
    breakdown.adherence * WEIGHTS.adherence +
      breakdown.assessment * WEIGHTS.assessment +
      breakdown.vitals * WEIGHTS.vitals +
      breakdown.activity * WEIGHTS.activity,
  );

  return { score, breakdown };
}

export async function recomputeAndStoreHealthScore(patientProfileId: string) {
  const { score, breakdown } = await computeHealthScore(patientProfileId);
  return prisma.healthScore.create({
    data: {
      patientProfileId,
      score,
      breakdown: breakdown as unknown as Prisma.InputJsonValue,
    },
  });
}
