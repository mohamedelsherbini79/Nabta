import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { getInteractionFindingsForDrug, getMedicationWithDetails, toMedicationSummary } from "@/lib/medications";
import { MedicationDetail } from "@/components/medications/MedicationDetail";

export default async function MedicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const { id } = await params;
  const medication = await getMedicationWithDetails(id);
  if (!medication) {
    notFound();
  }

  const allowed = await canAccessProfile(user.id, medication.patientProfileId);
  if (!allowed) {
    notFound();
  }

  const interactions = medication.drugCatalogId
    ? await getInteractionFindingsForDrug(medication.patientProfileId, medication.drugCatalogId, medication.id)
    : [];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-6">
      <MedicationDetail medication={toMedicationSummary(medication)} interactions={interactions} />
    </div>
  );
}
