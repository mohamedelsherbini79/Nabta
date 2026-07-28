import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const chatMessageSchema = z.object({
  conversationId: z.string().cuid().optional().nullable(),
  message: z.string().trim().min(1).max(4000),
  kind: z.enum(["PATIENT_AI", "PHARMACIST"]).optional(),
});
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

const timeOfDaySchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid time (HH:MM)");

export const medicationScheduleSchema = z.object({
  timesOfDay: z.array(timeOfDaySchema).min(1).max(12),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).max(7).default([]),
  timezone: z.string().trim().min(1).max(64),
  ramadanShift: z.boolean().default(false),
});
export type MedicationScheduleInput = z.infer<typeof medicationScheduleSchema>;

export const medicationStockSchema = z.object({
  quantityOnHand: z.coerce.number().min(0).max(100000),
  unit: z.string().trim().min(1).max(20),
  lowStockThreshold: z.coerce.number().min(0).max(100000),
});
export type MedicationStockInput = z.infer<typeof medicationStockSchema>;

const medicationDrugFields = {
  drugCatalogId: z.string().cuid().optional().nullable(),
  customName: z.string().trim().min(1).max(150).optional().nullable(),
  dosageForm: z.string().trim().max(50).optional().nullable(),
  strength: z.string().trim().max(50).optional().nullable(),
  addedVia: z.enum(["MANUAL", "BARCODE", "QR"]).default("MANUAL"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
};

export const addMedicationSchema = z
  .object({
    patientProfileId: z.string().cuid(),
    ...medicationDrugFields,
    schedule: medicationScheduleSchema.optional(),
    stock: medicationStockSchema.optional(),
  })
  .refine((v) => !!v.drugCatalogId || !!v.customName, {
    message: "Select a medication or enter a custom name",
    path: ["customName"],
  });
export type AddMedicationInput = z.infer<typeof addMedicationSchema>;

export const updateMedicationSchema = z.object({
  drugCatalogId: z.string().cuid().optional().nullable(),
  customName: z.string().trim().min(1).max(150).optional().nullable(),
  dosageForm: z.string().trim().max(50).optional().nullable(),
  strength: z.string().trim().max(50).optional().nullable(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  schedule: medicationScheduleSchema
    .partial()
    .extend({ active: z.boolean().optional() })
    .optional(),
  stock: medicationStockSchema.optional(),
});
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>;

export const doseStatusSchema = z.object({
  status: z.enum(["TAKEN", "MISSED", "SKIPPED"]),
});
export type DoseStatusInput = z.infer<typeof doseStatusSchema>;

export const drugCatalogSearchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  barcode: z.string().trim().max(100).optional(),
});
export type DrugCatalogSearchInput = z.infer<typeof drugCatalogSearchSchema>;

export const vitalsTypeSchema = z.enum([
  "BLOOD_PRESSURE",
  "GLUCOSE",
  "TEMPERATURE",
  "WEIGHT",
  "SPO2",
  "HEART_RATE",
]);
export type VitalsTypeInput = z.infer<typeof vitalsTypeSchema>;

const bloodPressureValueSchema = z.object({
  systolic: z.coerce.number().min(40).max(300),
  diastolic: z.coerce.number().min(20).max(200),
});
const glucoseValueSchema = z.object({
  value: z.coerce.number().min(20).max(700),
  unit: z.enum(["MG_DL", "MMOL_L"]).default("MG_DL"),
  context: z.enum(["FASTING", "POSTPRANDIAL", "RANDOM"]).optional(),
});
const temperatureValueSchema = z.object({
  value: z.coerce.number().min(25).max(45),
  unit: z.enum(["C", "F"]).default("C"),
});
const weightValueSchema = z.object({
  value: z.coerce.number().min(1).max(400),
  unit: z.enum(["KG", "LB"]).default("KG"),
});
const spo2ValueSchema = z.object({ value: z.coerce.number().min(50).max(100) });
const heartRateValueSchema = z.object({ value: z.coerce.number().min(20).max(250) });

export const vitalsRecordSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("BLOOD_PRESSURE"), value: bloodPressureValueSchema, recordedAt: z.coerce.date().optional() }),
  z.object({ type: z.literal("GLUCOSE"), value: glucoseValueSchema, recordedAt: z.coerce.date().optional() }),
  z.object({ type: z.literal("TEMPERATURE"), value: temperatureValueSchema, recordedAt: z.coerce.date().optional() }),
  z.object({ type: z.literal("WEIGHT"), value: weightValueSchema, recordedAt: z.coerce.date().optional() }),
  z.object({ type: z.literal("SPO2"), value: spo2ValueSchema, recordedAt: z.coerce.date().optional() }),
  z.object({ type: z.literal("HEART_RATE"), value: heartRateValueSchema, recordedAt: z.coerce.date().optional() }),
]);
export type VitalsRecordInput = z.infer<typeof vitalsRecordSchema>;

export const selfAssessmentSchema = z.object({
  dob: z.coerce.date().optional().nullable(),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  bloodType: z.string().trim().max(5).optional().nullable(),
  heightCm: z.coerce.number().min(30).max(280).optional().nullable(),
  weightKg: z.coerce.number().min(2).max(400).optional().nullable(),
  chronicConditions: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  allergies: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  lifestyle: z
    .object({
      smoking: z.enum(["NONE", "OCCASIONAL", "REGULAR"]).optional(),
      alcohol: z.enum(["NONE", "OCCASIONAL", "REGULAR"]).optional(),
      physicalActivity: z.enum(["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE"]).optional(),
    })
    .optional(),
  goals: z
    .array(
      z.enum([
        "WEIGHT_LOSS",
        "MUSCLE_GAIN",
        "BETTER_SLEEP",
        "STRESS_REDUCTION",
        "GENERAL_WELLNESS",
        "MANAGE_CONDITION",
      ]),
    )
    .max(6)
    .default([]),
});
export type SelfAssessmentInput = z.infer<typeof selfAssessmentSchema>;

export const symptomLogSchema = z.object({
  severity: z.coerce.number().int().min(1).max(10),
  tags: z.array(z.string().trim().min(1).max(50)).max(15).default([]),
  note: z.string().trim().max(500).optional().nullable(),
  loggedAt: z.coerce.date().optional(),
});
export type SymptomLogInput = z.infer<typeof symptomLogSchema>;

export const dependentProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(100),
  relationship: z.enum(["CHILD", "PARENT", "SPOUSE", "OTHER"]),
  dob: z.coerce.date().optional().nullable(),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  bloodType: z.string().trim().max(5).optional().nullable(),
  heightCm: z.coerce.number().min(30).max(280).optional().nullable(),
  weightKg: z.coerce.number().min(2).max(400).optional().nullable(),
  chronicConditions: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  allergies: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
});
export type DependentProfileInput = z.infer<typeof dependentProfileSchema>;

export const delegateInviteSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  scope: z.enum(["FULL", "MEDICATION_ONLY", "VIEW_ONLY"]).default("FULL"),
});
export type DelegateInviteInput = z.infer<typeof delegateInviteSchema>;

export const cycleEntrySchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
    flow: z.enum(["LIGHT", "MEDIUM", "HEAVY"]).optional().nullable(),
    symptoms: z.array(z.string().trim().min(1).max(50)).max(15).default([]),
  })
  .refine((v) => !v.endDate || v.endDate >= v.startDate, {
    message: "End date cannot be before the start date",
    path: ["endDate"],
  });
export type CycleEntryInput = z.infer<typeof cycleEntrySchema>;

export const reminderSchema = z.object({
  label: z.string().trim().min(1).max(150),
  type: z.enum(["MEDICATION", "LOCATION", "VACCINATION", "PRESCRIPTION_RENEWAL", "APPOINTMENT", "HEAT"]),
  channel: z.enum(["PUSH", "SMS", "VOICE"]).default("PUSH"),
  scheduledFor: z.coerce.date(),
  recurrenceRule: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY"]).optional().nullable(),
  locationLabel: z.string().trim().max(100).optional().nullable(),
});
export type ReminderInput = z.infer<typeof reminderSchema>;

export const vaccinationRecordSchema = z
  .object({
    vaccineName: z.string().trim().min(1).max(100),
    doseNumber: z.coerce.number().int().min(1).max(20).default(1),
    administeredAt: z.coerce.date().optional().nullable(),
    dueAt: z.coerce.date().optional().nullable(),
  })
  .refine((v) => !!v.administeredAt || !!v.dueAt, {
    message: "Enter a date administered or a due date",
    path: ["dueAt"],
  });
export type VaccinationRecordInput = z.infer<typeof vaccinationRecordSchema>;

export const emergencyCardScopeSchema = z.object({
  medications: z.boolean().default(true),
  allergies: z.boolean().default(true),
  chronicConditions: z.boolean().default(true),
  bloodType: z.boolean().default(true),
  emergencyContact: z.boolean().default(true),
});
export type EmergencyCardScopeInput = z.infer<typeof emergencyCardScopeSchema>;

export const emergencyContactSchema = z.object({
  emergencyContactName: z.string().trim().max(100).optional().nullable(),
  emergencyContactPhone: z.string().trim().max(30).optional().nullable(),
});
export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;

export const doctorShareScopeSchema = z.object({
  demographics: z.boolean().default(true),
  bloodType: z.boolean().default(true),
  allergies: z.boolean().default(true),
  chronicConditions: z.boolean().default(true),
  medications: z.boolean().default(true),
  vitals: z.boolean().default(true),
  vaccinations: z.boolean().default(true),
  symptoms: z.boolean().default(true),
});
export type DoctorShareScopeInput = z.infer<typeof doctorShareScopeSchema>;

export const shareLinkDurationSchema = z
  .union([z.literal(24), z.literal(72), z.literal(168), z.literal(720)])
  .default(168);
export type ShareLinkDurationInput = z.infer<typeof shareLinkDurationSchema>;

export interface DoctorShareLinkInput {
  scope: DoctorShareScopeInput;
  expiresInHours: ShareLinkDurationInput;
}

export const expenseRecordSchema = z.object({
  category: z.enum(["MEDICATION", "CONSULTATION", "LAB_TEST", "HOSPITAL", "INSURANCE", "EQUIPMENT", "OTHER"]),
  amount: z.coerce.number().positive().max(10000000),
  currency: z.enum(["EGP", "AED", "SAR", "QAR", "OMR", "USD"]),
  incurredAt: z.coerce.date(),
  note: z.string().trim().max(200).optional().nullable(),
});
export type ExpenseRecordInput = z.infer<typeof expenseRecordSchema>;

export const bookConsultationSchema = z.object({
  doctorUserId: z.string().cuid(),
  scheduledFor: z.coerce.date(),
});
export type BookConsultationInput = z.infer<typeof bookConsultationSchema>;

export const communityPostSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});
export type CommunityPostInput = z.infer<typeof communityPostSchema>;

export const communityCommentSchema = z.object({
  content: z.string().trim().min(1).max(1000),
});
export type CommunityCommentInput = z.infer<typeof communityCommentSchema>;

export const pharmacyCartItemSchema = z.object({
  drugCatalogId: z.string().cuid(),
  quantity: z.coerce.number().int().min(1).max(100).default(1),
});
export type PharmacyCartItemInput = z.infer<typeof pharmacyCartItemSchema>;

export const pharmacyQuantitySchema = z.object({
  quantity: z.coerce.number().int().min(1).max(100),
});
export type PharmacyQuantityInput = z.infer<typeof pharmacyQuantitySchema>;

export const pharmacyDeliveryAddressSchema = z.object({
  addressLine: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(30),
});
export type PharmacyDeliveryAddressInput = z.infer<typeof pharmacyDeliveryAddressSchema>;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z
    .union([z.string().trim().regex(/^\+?[1-9]\d{6,14}$/, "Enter a valid phone number, e.g. +201001234567"), z.literal("")])
    .optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateLocaleSchema = z.object({
  preferredLocale: z.enum(["ar", "en", "zh", "hi", "es", "fr"]),
});
export type UpdateLocaleInput = z.infer<typeof updateLocaleSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const updateUserRoleSchema = z.object({
  role: z.enum(["PATIENT", "DOCTOR", "PHARMACIST", "ADMIN"]),
});
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

export const adminDrugSchema = z.object({
  tradeName: z.string().trim().min(1).max(150),
  genericName: z.string().trim().min(1).max(150),
  activeIngredient: z.string().trim().min(1).max(200),
  dosageForms: z.array(z.string().trim().min(1).max(50)).max(10).default([]),
  commonSideEffects: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  contraindications: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  heatSensitive: z.boolean().default(false),
});
export type AdminDrugInput = z.infer<typeof adminDrugSchema>;

export const drugInteractionSchema = z.object({
  drugAId: z.string().cuid(),
  drugBId: z.string().cuid(),
  severity: z.enum(["MILD", "MODERATE", "SEVERE"]),
  description: z.string().trim().min(1).max(500),
});
export type DrugInteractionInput = z.infer<typeof drugInteractionSchema>;

export const systemNotificationSchema = z.object({
  title: z.string().trim().min(1).max(150),
  body: z.string().trim().min(1).max(2000),
});
export type SystemNotificationInput = z.infer<typeof systemNotificationSchema>;
