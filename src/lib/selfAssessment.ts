import { prisma } from "@/lib/prisma";
import { recomputeAndStoreHealthScore } from "@/lib/healthScore";
import { computeBmi } from "@/lib/bmi";
import { awardPoints } from "@/lib/loyalty";
import type { SelfAssessmentInput } from "@/lib/validation";
import type { Prisma } from "@/generated/prisma/client";

export function getLatestSelfAssessment(patientProfileId: string) {
  return prisma.selfAssessment.findFirst({
    where: { patientProfileId },
    orderBy: { version: "desc" },
  });
}

export async function submitSelfAssessment(patientProfileId: string, input: SelfAssessmentInput) {
  const bmi = input.heightCm && input.weightKg ? computeBmi(input.heightCm, input.weightKg) : null;

  const latest = await getLatestSelfAssessment(patientProfileId);
  const nextVersion = (latest?.version ?? 0) + 1;

  const assessment = await prisma.$transaction(async (tx) => {
    await tx.patientProfile.update({
      where: { id: patientProfileId },
      data: {
        dob: input.dob,
        sex: input.sex,
        bloodType: input.bloodType,
        heightCm: input.heightCm,
        weightKg: input.weightKg,
        chronicConditions: input.chronicConditions,
        allergies: input.allergies,
      },
    });

    return tx.selfAssessment.create({
      data: {
        patientProfileId,
        heightCm: input.heightCm,
        weightKg: input.weightKg,
        bmi,
        lifestyle: input.lifestyle as unknown as Prisma.InputJsonValue,
        goals: input.goals as unknown as Prisma.InputJsonValue,
        version: nextVersion,
      },
    });
  });

  const healthScore = await recomputeAndStoreHealthScore(patientProfileId);

  if (!latest) {
    await awardPoints(patientProfileId, 20, "SELF_ASSESSMENT_COMPLETED");
  }

  return { assessment, healthScore };
}
