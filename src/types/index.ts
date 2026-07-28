export type ChatRole = "USER" | "ASSISTANT";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export interface ApiErrorBody {
  error: string;
  message: string;
}

export interface DrugCatalogEntry {
  id: string;
  tradeName: string;
  genericName: string;
  activeIngredient: string;
  dosageForms: string[];
  commonSideEffects: string[];
  contraindications: string[];
  heatSensitive: boolean;
}

export interface MedicationScheduleSummary {
  id: string;
  timesOfDay: string[];
  daysOfWeek: number[];
  timezone: string;
  ramadanShift: boolean;
  active: boolean;
}

export interface MedicationStockSummary {
  id: string;
  quantityOnHand: number;
  unit: string;
  lowStockThreshold: number;
}

export interface MedicationSummary {
  id: string;
  patientProfileId: string;
  drugCatalogId: string | null;
  drugCatalog: DrugCatalogEntry | null;
  customName: string | null;
  dosageForm: string | null;
  strength: string | null;
  addedVia: "MANUAL" | "BARCODE" | "QR";
  startDate: string;
  endDate: string | null;
  schedules: MedicationScheduleSummary[];
  stock: MedicationStockSummary | null;
}

export type DoseStatus = "PENDING" | "TAKEN" | "MISSED" | "SKIPPED";

export interface DoseSummary {
  id: string;
  medicationScheduleId: string;
  scheduledFor: string;
  status: DoseStatus;
  actedAt: string | null;
  schedule: {
    medication: {
      id: string;
      customName: string | null;
      drugCatalog: DrugCatalogEntry | null;
    };
  };
}

export interface InteractionFindingSummary {
  drugAId: string;
  drugAName: string;
  drugBId: string;
  drugBName: string;
  severity: "MILD" | "MODERATE" | "SEVERE";
  description: string;
}

export interface SymptomLogSummary {
  id: string;
  loggedAt: string;
  severity: number;
  tags: string[];
  note: string | null;
  medications: string[];
}

export type VitalsType = "BLOOD_PRESSURE" | "GLUCOSE" | "TEMPERATURE" | "WEIGHT" | "SPO2" | "HEART_RATE";

export interface BloodPressureValue {
  systolic: number;
  diastolic: number;
}
export interface GlucoseValue {
  value: number;
  unit: "MG_DL" | "MMOL_L";
  context?: "FASTING" | "POSTPRANDIAL" | "RANDOM";
}
export interface TemperatureValue {
  value: number;
  unit: "C" | "F";
}
export interface WeightValue {
  value: number;
  unit: "KG" | "LB";
}
export interface Spo2Value {
  value: number;
}
export interface HeartRateValue {
  value: number;
}

export type VitalValue = BloodPressureValue | GlucoseValue | TemperatureValue | WeightValue | Spo2Value | HeartRateValue;

export interface VitalRecordSummary {
  id: string;
  patientProfileId: string;
  type: VitalsType;
  value: VitalValue;
  source: string;
  recordedAt: string;
}

export type FamilyRelationship = "SELF" | "CHILD" | "PARENT" | "SPOUSE" | "OTHER";
export type DelegateScope = "FULL" | "MEDICATION_ONLY" | "VIEW_ONLY";

export interface FamilyProfileSummary {
  id: string;
  familyGroupId: string;
  relationship: FamilyRelationship;
  displayName: string;
  dob: string | null;
  sex: string | null;
  bloodType: string | null;
  heightCm: number | null;
  weightKg: number | null;
  chronicConditions: string[];
  allergies: string[];
}

export interface FamilyDelegateSummary {
  id: string;
  familyGroupId: string;
  delegateUser: { id: string; name: string | null; email: string };
  scope: DelegateScope;
  invitedAt: string;
  acceptedAt: string | null;
  expiresAt: string | null;
}

export interface PendingInviteSummary {
  id: string;
  familyGroupId: string;
  scope: DelegateScope;
  invitedAt: string;
  familyOwnerName: string;
}

export type CycleFlow = "LIGHT" | "MEDIUM" | "HEAVY";

export interface CycleEntrySummary {
  id: string;
  startDate: string;
  endDate: string | null;
  flow: CycleFlow | null;
  symptoms: string[];
}

export type ReminderType = "MEDICATION" | "LOCATION" | "VACCINATION" | "PRESCRIPTION_RENEWAL" | "APPOINTMENT" | "HEAT";
export type ReminderChannel = "PUSH" | "SMS" | "VOICE";
export type ReminderRecurrence = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";

export interface ReminderSummary {
  id: string;
  label: string;
  type: ReminderType;
  channel: ReminderChannel;
  scheduledFor: string | null;
  recurrenceRule: ReminderRecurrence | null;
  active: boolean;
  locationLabel: string | null;
}

export type VaccinationStatus = "DUE" | "ADMINISTERED";

export interface VaccinationRecordSummary {
  id: string;
  vaccineName: string;
  doseNumber: number;
  administeredAt: string | null;
  dueAt: string | null;
  status: VaccinationStatus;
}

export interface ReportSummary {
  id: string;
  reportType: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  generatedAt: string | null;
}

export type ExpenseCategory =
  | "MEDICATION"
  | "CONSULTATION"
  | "LAB_TEST"
  | "HOSPITAL"
  | "INSURANCE"
  | "EQUIPMENT"
  | "OTHER";

export interface ExpenseRecordSummary {
  id: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  incurredAt: string;
  note: string | null;
}

export interface ExpenseCurrencyTotal {
  currency: string;
  monthTotal: number;
  yearTotal: number;
}

export interface ExpenseCategoryTotal {
  category: ExpenseCategory;
  currency: string;
  total: number;
}

export interface ExpenseSummary {
  totalsByCurrency: ExpenseCurrencyTotal[];
  byCategory: ExpenseCategoryTotal[];
}

export type ConsultationStatus = "BOOKED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export interface DoctorSummary {
  id: string;
  name: string | null;
  specialty: string | null;
}

export interface ConsultationSummary {
  id: string;
  scheduledFor: string;
  status: ConsultationStatus;
  doctor: DoctorSummary | null;
}

export interface CommunityAuthorSummary {
  id: string;
  name: string | null;
}

export interface CommunityGroupSummary {
  id: string;
  slug: string;
  name: string;
  conditionTag: string | null;
  memberCount: number;
  isMember: boolean;
}

export interface CommunityPostSummary {
  id: string;
  groupId: string;
  author: CommunityAuthorSummary;
  content: string;
  createdAt: string;
  commentCount: number;
}

export interface CommunityCommentSummary {
  id: string;
  postId: string;
  author: CommunityAuthorSummary;
  content: string;
  createdAt: string;
}

export interface PharmacyCartItemSummary {
  id: string;
  drugCatalogId: string;
  tradeName: string;
  quantity: number;
  unitPrice: number;
}

export interface PharmacyCartSummary {
  id: string;
  items: PharmacyCartItemSummary[];
  total: number;
}

export type PharmacyOrderStatus =
  | "AWAITING_PAYMENT"
  | "PLACED"
  | "CONFIRMED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "PAYMENT_FAILED";

export interface PharmacyOrderSummary {
  id: string;
  status: PharmacyOrderStatus;
  items: PharmacyCartItemSummary[];
  total: number;
  createdAt: string;
}

export type UserRole = "PATIENT" | "DOCTOR" | "PHARMACIST" | "ADMIN";

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  specialty: string | null;
  createdAt: string;
}

export interface AdminConsultationSummary {
  id: string;
  scheduledFor: string;
  status: ConsultationStatus;
  patientDisplayName: string;
  doctor: DoctorSummary | null;
}

export interface DoctorConsultationSummary {
  id: string;
  scheduledFor: string;
  status: ConsultationStatus;
  patientDisplayName: string;
}

export interface AdminReportSummary {
  id: string;
  patientDisplayName: string;
  reportType: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  generatedAt: string | null;
  healthScore: number | null;
  symptomLogCount: number | null;
  avgSymptomSeverity: number | null;
}

export interface AdminConversationSummary {
  id: string;
  title: string;
  kind: "PATIENT_AI" | "PHARMACIST" | "SUPPORT";
  userEmail: string;
  messageCount: number;
  updatedAt: string;
}

export interface AdminMessageSummary {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

export interface AdminDrugSummary {
  id: string;
  tradeName: string;
  genericName: string;
  activeIngredient: string;
  dosageForms: string[];
  commonSideEffects: string[];
  contraindications: string[];
  heatSensitive: boolean;
  source: string;
}

export interface AdminDrugInteractionSummary {
  id: string;
  drugAId: string;
  drugAName: string;
  drugBId: string;
  drugBName: string;
  severity: "MILD" | "MODERATE" | "SEVERE";
  description: string;
}

export interface AdminNotificationSummary {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  totalReceipts: number;
  readReceipts: number;
}

export interface AdminAuditLogSummary {
  id: string;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
}

export interface AnalyticsWeeklySignup {
  weekStart: string;
  count: number;
}

export interface AnalyticsSummary {
  usersByRole: Record<UserRole, number>;
  patientProfileCount: number;
  consultationsByStatus: Record<ConsultationStatus, number>;
  pharmacyOrderCount: number;
  pharmacyRevenue: number;
  communityPostCount: number;
  communityCommentCount: number;
  loyaltyPointsIssued: number;
  weeklySignups: AnalyticsWeeklySignup[];
}
