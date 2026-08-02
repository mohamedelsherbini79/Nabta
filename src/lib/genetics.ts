import { prisma } from "@/lib/prisma";
import type { GeneticProfileInput } from "@/lib/validation";
import type { DrugGeneCheckResult, GeneVariant, GeneticProfileSummary } from "@/types";

interface GeneticProfileRow {
  id: string;
  source: string;
  variants: unknown;
  uploadedAt: Date;
}

export function getGeneticProfile(patientProfileId: string) {
  return prisma.geneticProfile.findUnique({ where: { patientProfileId } });
}

export async function upsertGeneticProfile(patientProfileId: string, input: GeneticProfileInput) {
  return prisma.geneticProfile.upsert({
    where: { patientProfileId },
    create: { patientProfileId, source: input.source, variants: input.variants },
    update: { source: input.source, variants: input.variants, uploadedAt: new Date() },
  });
}

export function toGeneticProfileSummary(profile: GeneticProfileRow): GeneticProfileSummary {
  return {
    id: profile.id,
    source: profile.source as GeneticProfileSummary["source"],
    variants: (profile.variants as GeneVariant[]) ?? [],
    uploadedAt: profile.uploadedAt.toISOString(),
  };
}

// Reference table of well-established CPIC pharmacogenomic gene-drug pairs.
// Informational only, not a substitute for pharmacist/doctor review.
const DRUG_GENE_RULES: Record<string, { gene: string; alteredMessage: string; recommendation: string }> = {
  warfarin: {
    gene: "CYP2C9",
    alteredMessage: "Reduced ability to metabolize warfarin — higher bleeding risk at standard doses.",
    recommendation: "Dosing typically needs to be lower and monitored closely (INR).",
  },
  clopidogrel: {
    gene: "CYP2C19",
    alteredMessage: "Reduced conversion of clopidogrel to its active form — it may be less effective.",
    recommendation: "An alternative antiplatelet may be considered.",
  },
  codeine: {
    gene: "CYP2D6",
    alteredMessage: "Altered conversion of codeine to morphine — effect may be much stronger or weaker than expected.",
    recommendation: "An alternative pain reliever is often preferred.",
  },
  simvastatin: {
    gene: "SLCO1B1",
    alteredMessage: "Reduced clearance of simvastatin — higher risk of muscle-related side effects.",
    recommendation: "A lower dose or an alternative statin may be considered.",
  },
  azathioprine: {
    gene: "TPMT",
    alteredMessage: "Reduced ability to metabolize azathioprine — higher risk of toxicity at standard doses.",
    recommendation: "Dosing typically needs to be significantly reduced.",
  },
};

export function checkDrugGene(drugName: string, variants: GeneVariant[]): DrugGeneCheckResult {
  const key = drugName.trim().toLowerCase();
  const rule = DRUG_GENE_RULES[key];

  if (!rule) {
    return {
      drugName,
      safe: true,
      summary: "No known pharmacogenomic interaction on file for this medication.",
      warnings: [],
    };
  }

  const match = variants.find((v) => v.gene.toUpperCase() === rule.gene && v.phenotype.toLowerCase() !== "normal");

  if (!match) {
    return {
      drugName,
      safe: true,
      summary: `No altered ${rule.gene} phenotype found in your profile for this medication.`,
      warnings: [],
    };
  }

  return {
    drugName,
    safe: false,
    summary: `Your ${rule.gene} phenotype (${match.phenotype}) may affect how you respond to this medication.`,
    warnings: [
      {
        gene: rule.gene,
        phenotype: match.phenotype,
        message: rule.alteredMessage,
        recommendation: rule.recommendation,
      },
    ],
  };
}

export function getGeneticInsights(variants: GeneVariant[]): DrugGeneCheckResult["warnings"] {
  const warnings: DrugGeneCheckResult["warnings"] = [];
  for (const [, rule] of Object.entries(DRUG_GENE_RULES)) {
    const match = variants.find((v) => v.gene.toUpperCase() === rule.gene && v.phenotype.toLowerCase() !== "normal");
    if (match && !warnings.some((w) => w.gene === rule.gene)) {
      warnings.push({
        gene: rule.gene,
        phenotype: match.phenotype,
        message: rule.alteredMessage,
        recommendation: rule.recommendation,
      });
    }
  }
  return warnings;
}
