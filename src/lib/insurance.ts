import { prisma } from "@/lib/prisma";
import type { InsuranceClaimInput, InsuranceClaimStatusInput, InsurancePolicyInput } from "@/lib/validation";
import type { InsuranceClaimSummary, InsurancePolicySummary } from "@/types";

interface InsuranceClaimRow {
  id: string;
  description: string;
  amount: number;
  status: string;
  submittedAt: Date;
}

interface InsurancePolicyRow {
  id: string;
  provider: string;
  policyNumber: string;
  memberId: string | null;
  planType: string | null;
  expiryDate: Date | null;
  claims: InsuranceClaimRow[];
}

export function getPoliciesForProfile(patientProfileId: string) {
  return prisma.insurancePolicy.findMany({
    where: { patientProfileId },
    include: { claims: { orderBy: { submittedAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export function createPolicy(patientProfileId: string, input: InsurancePolicyInput) {
  return prisma.insurancePolicy.create({
    data: {
      patientProfileId,
      provider: input.provider,
      policyNumber: input.policyNumber,
      memberId: input.memberId ?? null,
      planType: input.planType ?? null,
      expiryDate: input.expiryDate ?? null,
    },
  });
}

export function deletePolicy(id: string) {
  return prisma.insurancePolicy.delete({ where: { id } });
}

export function createClaim(policyId: string, input: InsuranceClaimInput) {
  return prisma.insuranceClaim.create({
    data: { policyId, description: input.description, amount: input.amount },
  });
}

export function updateClaimStatus(id: string, input: InsuranceClaimStatusInput) {
  return prisma.insuranceClaim.update({ where: { id }, data: { status: input.status } });
}

export function toInsuranceClaimSummary(claim: InsuranceClaimRow): InsuranceClaimSummary {
  return {
    id: claim.id,
    description: claim.description,
    amount: claim.amount,
    status: claim.status as InsuranceClaimSummary["status"],
    submittedAt: claim.submittedAt.toISOString(),
  };
}

export function toInsurancePolicySummary(policy: InsurancePolicyRow): InsurancePolicySummary {
  return {
    id: policy.id,
    provider: policy.provider,
    policyNumber: policy.policyNumber,
    memberId: policy.memberId,
    planType: policy.planType,
    expiryDate: policy.expiryDate ? policy.expiryDate.toISOString() : null,
    claims: policy.claims.map(toInsuranceClaimSummary),
  };
}
