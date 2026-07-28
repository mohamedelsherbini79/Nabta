import { prisma } from "@/lib/prisma";
import type { AdminDrugInput, DrugInteractionInput } from "@/lib/validation";
import type {
  AdminAuditLogSummary,
  AdminConsultationSummary,
  AdminConversationSummary,
  AdminDrugInteractionSummary,
  AdminDrugSummary,
  AdminMessageSummary,
  AdminNotificationSummary,
  AdminReportSummary,
  AdminUserSummary,
  AnalyticsSummary,
  ConsultationStatus,
  UserRole,
} from "@/types";

const WEEKS_OF_SIGNUP_HISTORY = 12;

// ── Users ──────────────────────────────────────────────────────────────

export async function getAllUsers(search?: string) {
  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: { id: true, email: true, name: true, role: true, specialty: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export function updateUserRole(userId: string, role: UserRole) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, name: true, role: true, specialty: true, createdAt: true },
  });
}

interface UserForSummary {
  id: string;
  email: string;
  name: string | null;
  role: string;
  specialty: string | null;
  createdAt: Date;
}

export function toAdminUserSummary(user: UserForSummary): AdminUserSummary {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    specialty: user.specialty,
    createdAt: user.createdAt.toISOString(),
  };
}

// ── Consultations ──────────────────────────────────────────────────────

export async function getAllConsultationsAdmin(statusFilter?: ConsultationStatus) {
  const consultations = await prisma.consultation.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: { patientProfile: { select: { displayName: true } } },
    orderBy: { scheduledFor: "desc" },
    take: 200,
  });

  const doctorIds = Array.from(new Set(consultations.map((c) => c.doctorUserId)));
  const doctors = doctorIds.length > 0 ? await prisma.user.findMany({ where: { id: { in: doctorIds } } }) : [];
  const doctorById = new Map(doctors.map((d) => [d.id, d]));

  return consultations.map((c) => ({ ...c, doctor: doctorById.get(c.doctorUserId) ?? null }));
}

interface ConsultationAdminForSummary {
  id: string;
  scheduledFor: Date;
  status: string;
  patientProfile: { displayName: string };
  doctor: { id: string; name: string | null; specialty: string | null } | null;
}

export function toAdminConsultationSummary(c: ConsultationAdminForSummary): AdminConsultationSummary {
  return {
    id: c.id,
    scheduledFor: c.scheduledFor.toISOString(),
    status: c.status as ConsultationStatus,
    patientDisplayName: c.patientProfile.displayName,
    doctor: c.doctor ? { id: c.doctor.id, name: c.doctor.name, specialty: c.doctor.specialty } : null,
  };
}

// ── Reports ────────────────────────────────────────────────────────────

export async function getAllReportsAdmin() {
  return prisma.monthlyReport.findMany({
    include: { patientProfile: { select: { displayName: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

interface ReportAdminForSummary {
  id: string;
  patientProfile: { displayName: string };
  reportType: string;
  periodStart: Date;
  periodEnd: Date;
  status: string;
  generatedAt: Date | null;
  dataSnapshot: unknown;
}

export function toAdminReportSummary(r: ReportAdminForSummary): AdminReportSummary {
  const snapshot = r.dataSnapshot as {
    healthScore?: { score?: number };
    symptomLogCount?: number;
    avgSymptomSeverity?: number | null;
  } | null;

  return {
    id: r.id,
    patientDisplayName: r.patientProfile.displayName,
    reportType: r.reportType,
    periodStart: r.periodStart.toISOString(),
    periodEnd: r.periodEnd.toISOString(),
    status: r.status,
    generatedAt: r.generatedAt ? r.generatedAt.toISOString() : null,
    healthScore: snapshot?.healthScore?.score ?? null,
    symptomLogCount: snapshot?.symptomLogCount ?? null,
    avgSymptomSeverity: snapshot?.avgSymptomSeverity ?? null,
  };
}

// ── Chatbot logs ───────────────────────────────────────────────────────

export async function getAllConversationsAdmin(kindFilter?: "PATIENT_AI" | "PHARMACIST" | "SUPPORT") {
  return prisma.conversation.findMany({
    where: kindFilter ? { kind: kindFilter } : undefined,
    include: { user: { select: { email: true } }, _count: { select: { messages: true } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
}

interface ConversationAdminForSummary {
  id: string;
  title: string;
  kind: string;
  user: { email: string };
  _count: { messages: number };
  updatedAt: Date;
}

export function toAdminConversationSummary(c: ConversationAdminForSummary): AdminConversationSummary {
  return {
    id: c.id,
    title: c.title,
    kind: c.kind as AdminConversationSummary["kind"],
    userEmail: c.user.email,
    messageCount: c._count.messages,
    updatedAt: c.updatedAt.toISOString(),
  };
}

export async function getConversationTranscript(conversationId: string) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
}

interface MessageForSummary {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}

export function toAdminMessageSummary(m: MessageForSummary): AdminMessageSummary {
  return {
    id: m.id,
    role: m.role as AdminMessageSummary["role"],
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  };
}

// ── Drugs ──────────────────────────────────────────────────────────────

export function getAllDrugsAdmin(search?: string) {
  return prisma.drugCatalog.findMany({
    where: search
      ? {
          OR: [
            { tradeName: { contains: search, mode: "insensitive" } },
            { genericName: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { tradeName: "asc" },
  });
}

export function createDrug(input: AdminDrugInput) {
  return prisma.drugCatalog.create({ data: { ...input, source: "MANUAL" } });
}

export function updateDrug(id: string, input: AdminDrugInput) {
  return prisma.drugCatalog.update({ where: { id }, data: input });
}

export async function deleteDrug(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const medicationCount = await prisma.medication.count({ where: { drugCatalogId: id } });
  const prescriptionItemCount = await prisma.prescriptionItem.count({ where: { drugCatalogId: id } });
  const pharmacyOrderItemCount = await prisma.pharmacyOrderItem.count({ where: { drugCatalogId: id } });

  if (medicationCount > 0 || prescriptionItemCount > 0 || pharmacyOrderItemCount > 0) {
    return { ok: false, error: "This drug is referenced by existing medications or orders and cannot be deleted." };
  }

  await prisma.drugCatalog.delete({ where: { id } });
  return { ok: true };
}

interface DrugForSummary {
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

export function toAdminDrugSummary(d: DrugForSummary): AdminDrugSummary {
  return {
    id: d.id,
    tradeName: d.tradeName,
    genericName: d.genericName,
    activeIngredient: d.activeIngredient,
    dosageForms: d.dosageForms,
    commonSideEffects: d.commonSideEffects,
    contraindications: d.contraindications,
    heatSensitive: d.heatSensitive,
    source: d.source,
  };
}

export function getInteractionsForDrug(drugId: string) {
  return prisma.drugInteraction.findMany({
    where: { OR: [{ drugAId: drugId }, { drugBId: drugId }] },
    include: { drugA: { select: { tradeName: true } }, drugB: { select: { tradeName: true } } },
  });
}

export function createDrugInteraction(input: DrugInteractionInput) {
  return prisma.drugInteraction.create({
    data: input,
    include: { drugA: { select: { tradeName: true } }, drugB: { select: { tradeName: true } } },
  });
}

export function deleteDrugInteraction(id: string) {
  return prisma.drugInteraction.delete({ where: { id } });
}

interface DrugInteractionForSummary {
  id: string;
  drugAId: string;
  drugA: { tradeName: string };
  drugBId: string;
  drugB: { tradeName: string };
  severity: string;
  description: string;
}

export function toAdminDrugInteractionSummary(i: DrugInteractionForSummary): AdminDrugInteractionSummary {
  return {
    id: i.id,
    drugAId: i.drugAId,
    drugAName: i.drugA.tradeName,
    drugBId: i.drugBId,
    drugBName: i.drugB.tradeName,
    severity: i.severity as AdminDrugInteractionSummary["severity"],
    description: i.description,
  };
}

// ── Notifications ──────────────────────────────────────────────────────

export async function createSystemNotification(title: string, body: string) {
  return prisma.$transaction(async (tx) => {
    const notification = await tx.systemNotification.create({ data: { title, body } });
    const users = await tx.user.findMany({ select: { id: true } });
    if (users.length > 0) {
      await tx.notificationReceipt.createMany({
        data: users.map((u) => ({ notificationId: notification.id, userId: u.id })),
      });
    }
    return notification;
  });
}

export async function getRecentSystemNotifications() {
  const notifications = await prisma.systemNotification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { _count: { select: { receipts: true } } },
  });

  const readCounts = await prisma.notificationReceipt.groupBy({
    by: ["notificationId"],
    where: { notificationId: { in: notifications.map((n) => n.id) }, readAt: { not: null } },
    _count: { _all: true },
  });
  const readCountById = new Map(readCounts.map((r) => [r.notificationId, r._count._all]));

  return notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    createdAt: n.createdAt.toISOString(),
    totalReceipts: n._count.receipts,
    readReceipts: readCountById.get(n.id) ?? 0,
  })) satisfies AdminNotificationSummary[];
}

export function getUnreadNotificationsForUser(userId: string) {
  return prisma.notificationReceipt.findMany({
    where: { userId, readAt: null },
    include: { notification: true },
    orderBy: { notification: { createdAt: "desc" } },
  });
}

export async function markNotificationReceiptRead(receiptId: string, userId: string): Promise<boolean> {
  const result = await prisma.notificationReceipt.updateMany({
    where: { id: receiptId, userId },
    data: { readAt: new Date() },
  });
  return result.count > 0;
}

// ── Analytics ──────────────────────────────────────────────────────────

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const usersByRoleRaw = await prisma.user.groupBy({ by: ["role"], _count: { _all: true } });
  const usersByRole: AnalyticsSummary["usersByRole"] = { PATIENT: 0, DOCTOR: 0, PHARMACIST: 0, ADMIN: 0 };
  for (const row of usersByRoleRaw) {
    usersByRole[row.role as UserRole] = row._count._all;
  }

  const patientProfileCount = await prisma.patientProfile.count();

  const consultationsByStatusRaw = await prisma.consultation.groupBy({ by: ["status"], _count: { _all: true } });
  const consultationsByStatus: AnalyticsSummary["consultationsByStatus"] = {
    BOOKED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    NO_SHOW: 0,
  };
  for (const row of consultationsByStatusRaw) {
    consultationsByStatus[row.status as ConsultationStatus] = row._count._all;
  }

  const pharmacyOrders = await prisma.pharmacyOrder.findMany({
    where: { status: { notIn: ["CART", "CANCELLED"] } },
    include: { items: true },
  });
  const pharmacyOrderCount = pharmacyOrders.length;
  const pharmacyRevenue = pharmacyOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + Number(item.unitPrice) * item.quantity, 0),
    0,
  );

  const communityPostCount = await prisma.communityPost.count();
  const communityCommentCount = await prisma.communityComment.count();

  const loyaltyAgg = await prisma.loyaltyPointsLedger.aggregate({ _sum: { delta: true } });
  const loyaltyPointsIssued = loyaltyAgg._sum.delta ?? 0;

  const since = new Date(Date.now() - WEEKS_OF_SIGNUP_HISTORY * 7 * 24 * 60 * 60 * 1000);
  const recentUsers = await prisma.user.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });
  const weeklySignups = bucketByWeek(recentUsers.map((u) => u.createdAt), WEEKS_OF_SIGNUP_HISTORY);

  return {
    usersByRole,
    patientProfileCount,
    consultationsByStatus,
    pharmacyOrderCount,
    pharmacyRevenue,
    communityPostCount,
    communityCommentCount,
    loyaltyPointsIssued,
    weeklySignups,
  };
}

function bucketByWeek(dates: Date[], weeks: number): AnalyticsSummary["weeklySignups"] {
  const now = new Date();
  const buckets: { weekStart: string; count: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const count = dates.filter((d) => d >= weekStart && d < weekEnd).length;
    buckets.push({ weekStart: weekStart.toISOString().slice(0, 10), count });
  }
  return buckets;
}

// ── Audit log ──────────────────────────────────────────────────────────

export async function getRecentAuditLogs(limit = 30) {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const actorIds = Array.from(new Set(logs.map((l) => l.actorUserId).filter((id): id is string => !!id)));
  const actors = actorIds.length > 0 ? await prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, email: true } }) : [];
  const emailById = new Map(actors.map((a) => [a.id, a.email]));

  return logs.map((log) => ({
    id: log.id,
    actorEmail: log.actorUserId ? (emailById.get(log.actorUserId) ?? null) : null,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    createdAt: log.createdAt.toISOString(),
  })) satisfies AdminAuditLogSummary[];
}
