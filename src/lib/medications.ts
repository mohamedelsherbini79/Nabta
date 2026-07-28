import { prisma } from "@/lib/prisma";
import { checkInteractions } from "@/lib/interactions";
import type { DrugCatalogEntry, InteractionFindingSummary, MedicationSummary } from "@/types";

interface MedicationForSummary {
  id: string;
  patientProfileId: string;
  drugCatalogId: string | null;
  drugCatalog: DrugCatalogEntry | null;
  customName: string | null;
  dosageForm: string | null;
  strength: string | null;
  addedVia: string;
  startDate: Date;
  endDate: Date | null;
  schedules: {
    id: string;
    timesOfDay: string[];
    daysOfWeek: number[];
    timezone: string;
    ramadanShift: boolean;
    active: boolean;
  }[];
  stock: { id: string; quantityOnHand: number; unit: string; lowStockThreshold: number } | null;
}

export function toMedicationSummary(medication: MedicationForSummary): MedicationSummary {
  return {
    id: medication.id,
    patientProfileId: medication.patientProfileId,
    drugCatalogId: medication.drugCatalogId,
    drugCatalog: medication.drugCatalog,
    customName: medication.customName,
    dosageForm: medication.dosageForm,
    strength: medication.strength,
    addedVia: medication.addedVia as MedicationSummary["addedVia"],
    startDate: medication.startDate.toISOString(),
    endDate: medication.endDate?.toISOString() ?? null,
    schedules: medication.schedules,
    stock: medication.stock,
  };
}

export function getSelfPatientProfile(userId: string) {
  return prisma.patientProfile.findFirst({ where: { userId } });
}

export function getActiveMedicationsForProfile(patientProfileId: string) {
  return prisma.medication.findMany({
    where: {
      patientProfileId,
      OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
    },
    include: {
      drugCatalog: true,
      schedules: { where: { active: true } },
      stock: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getTodaysDosesForProfile(patientProfileId: string) {
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  return prisma.dose.findMany({
    where: {
      scheduledFor: { gte: startOfToday, lt: endOfToday },
      schedule: { medication: { patientProfileId } },
    },
    include: {
      schedule: { include: { medication: { include: { drugCatalog: true } } } },
    },
    orderBy: { scheduledFor: "asc" },
  });
}

interface DoseForSummary {
  id: string;
  medicationScheduleId: string;
  scheduledFor: Date;
  status: string;
  actedAt: Date | null;
  schedule: {
    medication: {
      id: string;
      customName: string | null;
      drugCatalog: DrugCatalogEntry | null;
    };
  };
}

export function toDoseSummary(dose: DoseForSummary) {
  return {
    id: dose.id,
    medicationScheduleId: dose.medicationScheduleId,
    scheduledFor: dose.scheduledFor.toISOString(),
    status: dose.status as "PENDING" | "TAKEN" | "MISSED" | "SKIPPED",
    actedAt: dose.actedAt?.toISOString() ?? null,
    schedule: dose.schedule,
  };
}

export function getMedicationWithDetails(id: string) {
  return prisma.medication.findUnique({
    where: { id },
    include: {
      drugCatalog: true,
      schedules: true,
      stock: true,
    },
  });
}

export type NamedInteractionFinding = InteractionFindingSummary;

async function namesForDrugIds(drugIds: string[]): Promise<Map<string, string>> {
  const catalogEntries = await prisma.drugCatalog.findMany({
    where: { id: { in: drugIds } },
    select: { id: true, tradeName: true },
  });
  return new Map(catalogEntries.map((d) => [d.id, d.tradeName]));
}

export async function getInteractionFindingsForProfile(
  patientProfileId: string,
): Promise<NamedInteractionFinding[]> {
  const medications = await getActiveMedicationsForProfile(patientProfileId);
  const drugIds = medications.map((m) => m.drugCatalogId).filter((id): id is string => !!id);

  const findings = await checkInteractions(drugIds);
  if (findings.length === 0) return [];

  const names = await namesForDrugIds(drugIds);
  return findings.map((f) => ({
    drugAId: f.drugAId,
    drugAName: names.get(f.drugAId) ?? f.drugAId,
    drugBId: f.drugBId,
    drugBName: names.get(f.drugBId) ?? f.drugBId,
    severity: f.severity as InteractionFindingSummary["severity"],
    description: f.description,
  }));
}

export async function getInteractionFindingsForDrug(
  patientProfileId: string,
  drugCatalogId: string,
  excludeMedicationId?: string,
): Promise<NamedInteractionFinding[]> {
  const medications = await getActiveMedicationsForProfile(patientProfileId);
  const otherDrugIds = medications
    .filter((m) => m.id !== excludeMedicationId)
    .map((m) => m.drugCatalogId)
    .filter((id): id is string => !!id);

  const findings = await checkInteractions([drugCatalogId, ...otherDrugIds]);
  const relevant = findings.filter(
    (f) => f.drugAId === drugCatalogId || f.drugBId === drugCatalogId,
  );
  if (relevant.length === 0) return [];

  const names = await namesForDrugIds([drugCatalogId, ...otherDrugIds]);
  return relevant.map((f) => ({
    drugAId: f.drugAId,
    drugAName: names.get(f.drugAId) ?? f.drugAId,
    drugBId: f.drugBId,
    drugBName: names.get(f.drugBId) ?? f.drugBId,
    severity: f.severity as InteractionFindingSummary["severity"],
    description: f.description,
  }));
}
