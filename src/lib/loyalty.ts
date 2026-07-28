import { prisma } from "@/lib/prisma";

export function getLedgerForProfile(patientProfileId: string, limit = 50) {
  return prisma.loyaltyPointsLedger.findMany({
    where: { patientProfileId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getBalance(patientProfileId: string): Promise<number> {
  const result = await prisma.loyaltyPointsLedger.aggregate({
    where: { patientProfileId },
    _sum: { delta: true },
  });
  return result._sum.delta ?? 0;
}

// Fire-and-forget-style helper called from other modules' write paths
// (dose taken, vitals logged, symptom logged, self-assessment completed).
export function awardPoints(patientProfileId: string, delta: number, reason: string) {
  return prisma.loyaltyPointsLedger.create({
    data: { patientProfileId, delta, reason },
  });
}

export interface LoyaltyLedgerEntrySummary {
  id: string;
  delta: number;
  reason: string;
  createdAt: string;
}

interface LoyaltyLedgerEntryForSummary {
  id: string;
  delta: number;
  reason: string;
  createdAt: Date;
}

export function toLoyaltyLedgerEntrySummary(entry: LoyaltyLedgerEntryForSummary): LoyaltyLedgerEntrySummary {
  return {
    id: entry.id,
    delta: entry.delta,
    reason: entry.reason,
    createdAt: entry.createdAt.toISOString(),
  };
}
