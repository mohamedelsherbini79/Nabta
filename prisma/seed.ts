import { randomUUID } from "crypto";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";

// Curated demo dataset (~35 common medications) for prototype purposes.
// DrugCatalog.source stays "SEED" to distinguish this from a real licensed
// registry import later (see src/lib/interactions.ts and the architecture
// plan's integration-point catalog).

interface DrugSeed {
  tradeName: string;
  genericName: string;
  activeIngredient: string;
  dosageForms: string[];
  commonSideEffects: string[];
  contraindications: string[];
  heatSensitive?: boolean;
}

const drugs: DrugSeed[] = [
  // Pain / fever
  { tradeName: "Panadol", genericName: "Paracetamol", activeIngredient: "Paracetamol (Acetaminophen)", dosageForms: ["Tablet", "Syrup"], commonSideEffects: ["Nausea", "Rash (rare)"], contraindications: ["Severe liver disease"] },
  { tradeName: "Panadol Extra", genericName: "Paracetamol/Caffeine", activeIngredient: "Paracetamol, Caffeine", dosageForms: ["Tablet"], commonSideEffects: ["Nausea", "Insomnia"], contraindications: ["Severe liver disease"] },
  { tradeName: "Brufen", genericName: "Ibuprofen", activeIngredient: "Ibuprofen", dosageForms: ["Tablet", "Syrup"], commonSideEffects: ["Stomach upset", "Heartburn"], contraindications: ["Active peptic ulcer", "Severe kidney disease", "Third trimester pregnancy"] },
  { tradeName: "Aspirin", genericName: "Aspirin", activeIngredient: "Acetylsalicylic acid", dosageForms: ["Tablet"], commonSideEffects: ["Stomach irritation", "Bleeding risk"], contraindications: ["Bleeding disorders", "Children with viral infection"] },
  { tradeName: "Voltaren", genericName: "Diclofenac", activeIngredient: "Diclofenac sodium", dosageForms: ["Tablet", "Gel", "Injection"], commonSideEffects: ["Stomach upset", "Headache"], contraindications: ["Active GI bleeding", "Severe heart failure"] },
  { tradeName: "Tramal", genericName: "Tramadol", activeIngredient: "Tramadol HCl", dosageForms: ["Capsule", "Injection"], commonSideEffects: ["Drowsiness", "Nausea", "Dizziness"], contraindications: ["Uncontrolled epilepsy", "Concurrent MAOI use"] },

  // Antibiotics
  { tradeName: "Augmentin", genericName: "Amoxicillin/Clavulanate", activeIngredient: "Amoxicillin, Clavulanic acid", dosageForms: ["Tablet", "Syrup"], commonSideEffects: ["Diarrhea", "Nausea"], contraindications: ["Penicillin allergy"] },
  { tradeName: "Zithromax", genericName: "Azithromycin", activeIngredient: "Azithromycin", dosageForms: ["Tablet", "Syrup"], commonSideEffects: ["Diarrhea", "Abdominal pain"], contraindications: ["Macrolide allergy", "Severe liver disease"] },
  { tradeName: "Ciproxin", genericName: "Ciprofloxacin", activeIngredient: "Ciprofloxacin", dosageForms: ["Tablet", "IV"], commonSideEffects: ["Nausea", "Tendon pain"], contraindications: ["Myasthenia gravis", "Pregnancy"] },
  { tradeName: "Flagyl", genericName: "Metronidazole", activeIngredient: "Metronidazole", dosageForms: ["Tablet", "IV"], commonSideEffects: ["Metallic taste", "Nausea"], contraindications: ["First trimester pregnancy", "Concurrent alcohol use"] },

  // Cardiovascular
  { tradeName: "Norvasc", genericName: "Amlodipine", activeIngredient: "Amlodipine besylate", dosageForms: ["Tablet"], commonSideEffects: ["Ankle swelling", "Flushing"], contraindications: ["Severe hypotension"] },
  { tradeName: "Concor", genericName: "Bisoprolol", activeIngredient: "Bisoprolol fumarate", dosageForms: ["Tablet"], commonSideEffects: ["Fatigue", "Cold extremities"], contraindications: ["Severe asthma", "Uncontrolled heart failure"] },
  { tradeName: "Coversyl", genericName: "Perindopril", activeIngredient: "Perindopril arginine", dosageForms: ["Tablet"], commonSideEffects: ["Dry cough", "Dizziness"], contraindications: ["Pregnancy", "History of angioedema"] },
  { tradeName: "Cozaar", genericName: "Losartan", activeIngredient: "Losartan potassium", dosageForms: ["Tablet"], commonSideEffects: ["Dizziness", "Hyperkalemia"], contraindications: ["Pregnancy", "Bilateral renal artery stenosis"] },
  { tradeName: "Plavix", genericName: "Clopidogrel", activeIngredient: "Clopidogrel bisulfate", dosageForms: ["Tablet"], commonSideEffects: ["Bruising", "Bleeding"], contraindications: ["Active bleeding", "Severe liver impairment"] },
  { tradeName: "Warfarin", genericName: "Warfarin", activeIngredient: "Warfarin sodium", dosageForms: ["Tablet"], commonSideEffects: ["Bleeding", "Bruising"], contraindications: ["Active bleeding", "Pregnancy"] },
  { tradeName: "Lipitor", genericName: "Atorvastatin", activeIngredient: "Atorvastatin calcium", dosageForms: ["Tablet"], commonSideEffects: ["Muscle aches", "Headache"], contraindications: ["Active liver disease", "Pregnancy"] },

  // Diabetes
  { tradeName: "Glucophage", genericName: "Metformin", activeIngredient: "Metformin HCl", dosageForms: ["Tablet"], commonSideEffects: ["Diarrhea", "Nausea"], contraindications: ["Severe kidney disease", "Metabolic acidosis"] },
  { tradeName: "Amaryl", genericName: "Glimepiride", activeIngredient: "Glimepiride", dosageForms: ["Tablet"], commonSideEffects: ["Hypoglycemia", "Weight gain"], contraindications: ["Type 1 diabetes", "Severe kidney/liver disease"] },
  { tradeName: "Lantus", genericName: "Insulin glargine", activeIngredient: "Insulin glargine", dosageForms: ["Injection"], commonSideEffects: ["Hypoglycemia", "Injection site reaction"], contraindications: ["Hypoglycemia episode"], heatSensitive: true },
  { tradeName: "Januvia", genericName: "Sitagliptin", activeIngredient: "Sitagliptin phosphate", dosageForms: ["Tablet"], commonSideEffects: ["Headache", "Upper respiratory infection"], contraindications: ["Type 1 diabetes"] },

  // Respiratory / allergy
  { tradeName: "Ventolin", genericName: "Salbutamol", activeIngredient: "Salbutamol sulfate", dosageForms: ["Inhaler", "Syrup"], commonSideEffects: ["Tremor", "Palpitations"], contraindications: ["Hypersensitivity to salbutamol"] },
  { tradeName: "Seretide", genericName: "Fluticasone/Salmeterol", activeIngredient: "Fluticasone propionate, Salmeterol", dosageForms: ["Inhaler"], commonSideEffects: ["Throat irritation", "Hoarseness"], contraindications: ["Untreated fungal/bacterial infection"] },
  { tradeName: "Claritin", genericName: "Loratadine", activeIngredient: "Loratadine", dosageForms: ["Tablet", "Syrup"], commonSideEffects: ["Headache", "Mild drowsiness"], contraindications: ["Severe liver disease (dose adjust)"] },
  { tradeName: "Zyrtec", genericName: "Cetirizine", activeIngredient: "Cetirizine HCl", dosageForms: ["Tablet", "Syrup"], commonSideEffects: ["Drowsiness", "Dry mouth"], contraindications: ["Severe kidney disease (dose adjust)"] },

  // Gastrointestinal
  { tradeName: "Nexium", genericName: "Esomeprazole", activeIngredient: "Esomeprazole magnesium", dosageForms: ["Tablet", "IV"], commonSideEffects: ["Headache", "Diarrhea"], contraindications: ["Concurrent nelfinavir use"] },
  { tradeName: "Losec", genericName: "Omeprazole", activeIngredient: "Omeprazole", dosageForms: ["Capsule"], commonSideEffects: ["Headache", "Abdominal pain"], contraindications: ["Concurrent nelfinavir use"] },
  { tradeName: "Zantac", genericName: "Ranitidine", activeIngredient: "Ranitidine HCl", dosageForms: ["Tablet"], commonSideEffects: ["Headache", "Constipation"], contraindications: ["Acute porphyria"] },
  { tradeName: "Motilium", genericName: "Domperidone", activeIngredient: "Domperidone", dosageForms: ["Tablet"], commonSideEffects: ["Dry mouth", "Headache"], contraindications: ["Heart rhythm disorders", "Severe liver disease"] },
  { tradeName: "Buscopan", genericName: "Hyoscine butylbromide", activeIngredient: "Hyoscine butylbromide", dosageForms: ["Tablet", "Injection"], commonSideEffects: ["Dry mouth", "Blurred vision"], contraindications: ["Glaucoma", "Myasthenia gravis"] },

  // Mental health / neuro
  { tradeName: "Xanax", genericName: "Alprazolam", activeIngredient: "Alprazolam", dosageForms: ["Tablet"], commonSideEffects: ["Drowsiness", "Dependence risk"], contraindications: ["Severe respiratory insufficiency", "Concurrent opioid use"] },
  { tradeName: "Cipralex", genericName: "Escitalopram", activeIngredient: "Escitalopram oxalate", dosageForms: ["Tablet"], commonSideEffects: ["Nausea", "Insomnia"], contraindications: ["Concurrent MAOI use", "QT prolongation"] },
  { tradeName: "Depakine", genericName: "Sodium valproate", activeIngredient: "Sodium valproate", dosageForms: ["Tablet", "Syrup"], commonSideEffects: ["Weight gain", "Tremor"], contraindications: ["Pregnancy", "Liver disease"] },

  // Hormones / supplements
  { tradeName: "Euthyrox", genericName: "Levothyroxine", activeIngredient: "Levothyroxine sodium", dosageForms: ["Tablet"], commonSideEffects: ["Palpitations (if overdosed)", "Insomnia"], contraindications: ["Untreated adrenal insufficiency", "Acute MI"] },
  { tradeName: "Devarol-S", genericName: "Vitamin D3", activeIngredient: "Colecalciferol", dosageForms: ["Ampoule", "Tablet"], commonSideEffects: ["Rare at normal doses"], contraindications: ["Hypercalcemia", "Vitamin D toxicity"] },
  { tradeName: "Ferose", genericName: "Ferrous sulfate", activeIngredient: "Ferrous sulfate", dosageForms: ["Tablet", "Syrup"], commonSideEffects: ["Constipation", "Dark stools"], contraindications: ["Hemochromatosis", "Hemolytic anemia"] },
];

interface InteractionSeed {
  a: string; // tradeName
  b: string; // tradeName
  severity: "MILD" | "MODERATE" | "SEVERE";
  description: string;
}

const interactions: InteractionSeed[] = [
  { a: "Warfarin", b: "Aspirin", severity: "SEVERE", description: "Combined use significantly increases bleeding risk." },
  { a: "Warfarin", b: "Brufen", severity: "SEVERE", description: "NSAIDs increase bleeding risk and can potentiate warfarin's effect." },
  { a: "Aspirin", b: "Brufen", severity: "MODERATE", description: "Ibuprofen may reduce aspirin's cardioprotective effect and adds GI bleeding risk." },
  { a: "Plavix", b: "Nexium", severity: "MODERATE", description: "Esomeprazole may reduce clopidogrel's antiplatelet effectiveness (CYP2C19 inhibition)." },
  { a: "Ciproxin", b: "Zantac", severity: "MILD", description: "Acid-reducing agents may modestly decrease ciprofloxacin absorption; separate dosing times." },
  { a: "Xanax", b: "Tramal", severity: "SEVERE", description: "Combined CNS and respiratory depression risk; use with extreme caution." },
  { a: "Cipralex", b: "Tramal", severity: "MODERATE", description: "Increased risk of serotonin syndrome when combined." },
  { a: "Amaryl", b: "Concor", severity: "MODERATE", description: "Beta-blockers can mask the warning signs of hypoglycemia." },
  { a: "Lipitor", b: "Zithromax", severity: "MILD", description: "Macrolide antibiotics can mildly raise statin levels, increasing myopathy risk." },
  { a: "Coversyl", b: "Cozaar", severity: "MODERATE", description: "Combined ACE inhibitor + ARB use increases risk of hyperkalemia, hypotension, and renal impairment." },
  { a: "Depakine", b: "Aspirin", severity: "MODERATE", description: "Aspirin can displace valproate from protein binding, raising free valproate levels and bleeding risk." },
  { a: "Voltaren", b: "Coversyl", severity: "MODERATE", description: "NSAIDs can blunt the antihypertensive effect of ACE inhibitors and increase kidney injury risk." },
];

// Demo doctor directory for the Consultations module — bookable entries that
// can also log in to their own doctor dashboard (src/app/doctor/**).
interface DoctorSeed {
  name: string;
  email: string;
  specialty: string;
}

const doctors: DoctorSeed[] = [
  { name: "Dr. Sara Ahmed", email: "dr.sara.ahmed@demo.local", specialty: "General Medicine" },
  { name: "Dr. Omar Khalil", email: "dr.omar.khalil@demo.local", specialty: "Cardiology" },
  { name: "Dr. Layla Mansour", email: "dr.layla.mansour@demo.local", specialty: "Pediatrics" },
];

async function seedDoctors() {
  const existing = await prisma.user.count({ where: { role: "DOCTOR" } });
  if (existing > 0) {
    console.log(`Found ${existing} DOCTOR users already — skipping doctor seed (idempotent).`);
    return;
  }

  const passwordHash = await hashPassword(`seed-doctor-${randomUUID()}`);
  for (const doctor of doctors) {
    await prisma.user.create({
      data: {
        email: doctor.email,
        name: doctor.name,
        specialty: doctor.specialty,
        role: "DOCTOR",
        passwordHash,
      },
    });
  }
  console.log(`Seeded ${doctors.length} demo doctors.`);
}

async function seedDrugs() {
  const existing = await prisma.drugCatalog.count();
  if (existing > 0) {
    console.log(`DrugCatalog already has ${existing} rows — skipping seed (idempotent).`);
    return;
  }

  const idByTradeName = new Map<string, string>();

  for (const drug of drugs) {
    const created = await prisma.drugCatalog.create({
      data: {
        tradeName: drug.tradeName,
        genericName: drug.genericName,
        activeIngredient: drug.activeIngredient,
        dosageForms: drug.dosageForms,
        commonSideEffects: drug.commonSideEffects,
        contraindications: drug.contraindications,
        heatSensitive: drug.heatSensitive ?? false,
        source: "SEED",
      },
    });
    idByTradeName.set(drug.tradeName, created.id);
  }
  console.log(`Seeded ${drugs.length} drugs into DrugCatalog.`);

  let interactionCount = 0;
  for (const interaction of interactions) {
    const drugAId = idByTradeName.get(interaction.a);
    const drugBId = idByTradeName.get(interaction.b);
    if (!drugAId || !drugBId) {
      console.warn(`Skipping interaction ${interaction.a} <-> ${interaction.b}: drug not found.`);
      continue;
    }
    await prisma.drugInteraction.create({
      data: {
        drugAId,
        drugBId,
        severity: interaction.severity,
        description: interaction.description,
      },
    });
    interactionCount += 1;
  }
  console.log(`Seeded ${interactionCount} drug interactions.`);
}

interface CommunityGroupSeed {
  slug: string;
  name: string;
  conditionTag: string | null;
}

const communityGroups: CommunityGroupSeed[] = [
  { slug: "diabetes", name: "Diabetes Support", conditionTag: "Diabetes" },
  { slug: "pregnancy-postpartum", name: "Pregnancy & Postpartum", conditionTag: "Pregnancy" },
  { slug: "heart-health", name: "Heart Health", conditionTag: "Cardiovascular" },
  { slug: "general-wellness", name: "General Wellness", conditionTag: null },
];

async function seedCommunityGroups() {
  const existing = await prisma.communityGroup.count();
  if (existing > 0) {
    console.log(`CommunityGroup already has ${existing} rows — skipping seed (idempotent).`);
    return;
  }

  for (const group of communityGroups) {
    await prisma.communityGroup.create({
      data: { slug: group.slug, name: group.name, conditionTag: group.conditionTag },
    });
  }
  console.log(`Seeded ${communityGroups.length} community groups.`);
}

interface HealthFacilitySeed {
  name: string;
  type: "HOSPITAL" | "CLINIC" | "PHARMACY" | "LAB";
  city: string;
  address: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

const healthFacilities: HealthFacilitySeed[] = [
  { name: "Qasr Al Ainy Hospital", type: "HOSPITAL", city: "Cairo", address: "Al Manial, Cairo", phone: "+20223684500", lat: 30.0295, lng: 31.2296 },
  { name: "Dar Al Fouad Hospital", type: "HOSPITAL", city: "Giza", address: "6th of October City, Giza", phone: "+20238281000", lat: 29.9679, lng: 30.9153 },
  { name: "Alexandria Main University Hospital", type: "HOSPITAL", city: "Alexandria", address: "Al Khartoum St, Alexandria", phone: "+20342865766", lat: 31.2001, lng: 29.9187 },
  { name: "As-Salam International Hospital", type: "HOSPITAL", city: "Cairo", address: "Corniche El Nil, Maadi, Cairo", phone: "+20225240250", lat: 29.9601, lng: 31.2569 },
  { name: "Nabta Family Clinic", type: "CLINIC", city: "Cairo", address: "Mohandessin, Cairo", phone: "+20233456789", lat: 30.0571, lng: 31.2001 },
  { name: "Al Salam Polyclinic", type: "CLINIC", city: "Giza", address: "Dokki, Giza", phone: "+20237601122", lat: 30.0378, lng: 31.2119 },
  { name: "Smouha Medical Center", type: "CLINIC", city: "Alexandria", address: "Smouha, Alexandria", phone: "+20342221100", lat: 31.2156, lng: 29.9553 },
  { name: "Seif Pharmacy", type: "PHARMACY", city: "Cairo", address: "Zamalek, Cairo", phone: "+20227351234", lat: 30.0626, lng: 31.2219 },
  { name: "El Ezaby Pharmacy", type: "PHARMACY", city: "Giza", address: "Haram St, Giza", phone: "+20233851234", lat: 29.9887, lng: 31.1342 },
  { name: "Roshdy Pharmacy", type: "PHARMACY", city: "Alexandria", address: "Roshdy, Alexandria", phone: "+20342456789", lat: 31.2258, lng: 29.9548 },
  { name: "Al Borg Laboratories", type: "LAB", city: "Cairo", address: "Nasr City, Cairo", phone: "+20222741234", lat: 30.0626, lng: 31.3467 },
  { name: "Alfa Lab", type: "LAB", city: "Giza", address: "6th of October City, Giza", phone: "+20238331234", lat: 29.9757, lng: 30.9296 },
  { name: "Biolab Alexandria", type: "LAB", city: "Alexandria", address: "Sidi Gaber, Alexandria", phone: "+20342781234", lat: 31.2247, lng: 29.9505 },
];

async function seedHealthFacilities() {
  const existing = await prisma.healthFacility.count();
  if (existing > 0) {
    console.log(`HealthFacility already has ${existing} rows — skipping seed (idempotent).`);
    return;
  }

  for (const facility of healthFacilities) {
    await prisma.healthFacility.create({
      data: {
        name: facility.name,
        type: facility.type,
        city: facility.city,
        address: facility.address,
        phone: facility.phone ?? null,
        lat: facility.lat ?? null,
        lng: facility.lng ?? null,
      },
    });
  }
  console.log(`Seeded ${healthFacilities.length} health facilities.`);
}

async function main() {
  await seedDrugs();
  await seedDoctors();
  await seedCommunityGroups();
  await seedHealthFacilities();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
