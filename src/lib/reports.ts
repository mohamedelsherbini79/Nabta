import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { computeHealthScore, type HealthScoreBreakdown } from "@/lib/healthScore";
import { getRecentSymptomLogs } from "@/lib/symptoms";
import { getVitalsForProfile } from "@/lib/vitals";
import { getVaccinationsForProfile } from "@/lib/vaccinations";
import { getLatestSelfAssessment } from "@/lib/selfAssessment";
import { getBmiCategory } from "@/lib/bmi";
import type { ReportSummary } from "@/types";

const WINDOW_DAYS = 30;

export interface ReportSnapshot {
  patientDisplayName: string;
  periodStart: string;
  periodEnd: string;
  healthScore: { score: number; breakdown: HealthScoreBreakdown };
  symptomLogCount: number;
  avgSymptomSeverity: number | null;
  vitalsLoggedCount: number;
  vaccinationsAdministeredCount: number;
  latestBmi: { value: number; category: string } | null;
}

export function getReportsForProfile(patientProfileId: string) {
  return prisma.monthlyReport.findMany({
    where: { patientProfileId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reportType: true,
      periodStart: true,
      periodEnd: true,
      status: true,
      generatedAt: true,
    },
  });
}

export function getReportById(id: string) {
  return prisma.monthlyReport.findUnique({ where: { id } });
}

export async function generateReport(patientProfileId: string) {
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const profile = await prisma.patientProfile.findUnique({ where: { id: patientProfileId } });

  const { score, breakdown } = await computeHealthScore(patientProfileId);
  const symptomLogs = await getRecentSymptomLogs(patientProfileId, WINDOW_DAYS);
  const vitals = await getVitalsForProfile(patientProfileId, WINDOW_DAYS);
  const vaccinations = await getVaccinationsForProfile(patientProfileId);
  const latestAssessment = await getLatestSelfAssessment(patientProfileId);

  const avgSymptomSeverity =
    symptomLogs.length > 0
      ? Math.round((symptomLogs.reduce((sum, log) => sum + log.severity, 0) / symptomLogs.length) * 10) / 10
      : null;

  const vaccinationsAdministeredCount = vaccinations.filter(
    (v) => v.administeredAt && v.administeredAt >= periodStart && v.administeredAt <= periodEnd,
  ).length;

  const latestBmi =
    latestAssessment?.bmi != null ? { value: latestAssessment.bmi, category: getBmiCategory(latestAssessment.bmi) } : null;

  const snapshot: ReportSnapshot = {
    patientDisplayName: profile?.displayName ?? "—",
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    healthScore: { score, breakdown },
    symptomLogCount: symptomLogs.length,
    avgSymptomSeverity,
    vitalsLoggedCount: vitals.length,
    vaccinationsAdministeredCount,
    latestBmi,
  };

  return prisma.monthlyReport.create({
    data: {
      patientProfileId,
      reportType: "HEALTH",
      periodStart,
      periodEnd,
      status: "READY",
      generatedAt: new Date(),
      dataSnapshot: snapshot as unknown as Prisma.InputJsonValue,
    },
  });
}

export function deleteReport(id: string) {
  return prisma.monthlyReport.delete({ where: { id } });
}

interface ReportForSummary {
  id: string;
  reportType: string;
  periodStart: Date;
  periodEnd: Date;
  status: string;
  generatedAt: Date | null;
}

export function toReportSummary(report: ReportForSummary): ReportSummary {
  return {
    id: report.id,
    reportType: report.reportType,
    periodStart: report.periodStart.toISOString(),
    periodEnd: report.periodEnd.toISOString(),
    status: report.status,
    generatedAt: report.generatedAt ? report.generatedAt.toISOString() : null,
  };
}
