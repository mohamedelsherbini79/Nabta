import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { ReminderInput } from "@/lib/validation";
import type { ReminderSummary } from "@/types";

export function getRemindersForProfile(patientProfileId: string) {
  return prisma.reminder.findMany({
    where: { patientProfileId },
    orderBy: { scheduledFor: "asc" },
  });
}

export function createReminder(
  patientProfileId: string,
  input: ReminderInput,
  related?: { type: string; id: string },
) {
  return prisma.reminder.create({
    data: {
      patientProfileId,
      label: input.label,
      type: input.type,
      channel: input.channel,
      scheduledFor: input.scheduledFor,
      recurrenceRule: input.recurrenceRule ?? "NONE",
      locationTrigger: input.locationLabel ? ({ label: input.locationLabel } as Prisma.InputJsonValue) : undefined,
      ...(related && { relatedEntityType: related.type, relatedEntityId: related.id }),
    },
  });
}

export function deleteRemindersForEntity(relatedEntityType: string, relatedEntityId: string) {
  return prisma.reminder.deleteMany({ where: { relatedEntityType, relatedEntityId } });
}

export function updateReminder(
  id: string,
  input: Partial<Pick<ReminderInput, "label" | "scheduledFor" | "recurrenceRule">> & { active?: boolean },
) {
  return prisma.reminder.update({
    where: { id },
    data: {
      ...(input.label !== undefined && { label: input.label }),
      ...(input.scheduledFor !== undefined && { scheduledFor: input.scheduledFor }),
      ...(input.recurrenceRule !== undefined && { recurrenceRule: input.recurrenceRule }),
      ...(input.active !== undefined && { active: input.active }),
    },
  });
}

export function deleteReminder(id: string) {
  return prisma.reminder.delete({ where: { id } });
}

export function getDueReminders() {
  return prisma.reminder.findMany({
    where: { active: true, scheduledFor: { lte: new Date() } },
  });
}

function advanceScheduledFor(current: Date, recurrenceRule: string): Date {
  const next = new Date(current);
  if (recurrenceRule === "DAILY") next.setUTCDate(next.getUTCDate() + 1);
  else if (recurrenceRule === "WEEKLY") next.setUTCDate(next.getUTCDate() + 7);
  else if (recurrenceRule === "MONTHLY") next.setUTCMonth(next.getUTCMonth() + 1);
  return next;
}

// Records a dispatch attempt and advances the reminder past this occurrence:
// recurring reminders roll scheduledFor forward by one interval (a long
// scheduler outage needs a few ticks to fully catch up, not an immediate
// jump); one-off reminders deactivate so they stop reappearing as due.
export function markReminderProcessed(
  reminder: { id: string; scheduledFor: Date | null; recurrenceRule: string | null },
  status: string,
) {
  const isRecurring = reminder.recurrenceRule && reminder.recurrenceRule !== "NONE";

  if (isRecurring && reminder.scheduledFor) {
    return prisma.reminder.update({
      where: { id: reminder.id },
      data: {
        lastSentAt: new Date(),
        lastDeliveryStatus: status,
        scheduledFor: advanceScheduledFor(reminder.scheduledFor, reminder.recurrenceRule as string),
      },
    });
  }

  return prisma.reminder.update({
    where: { id: reminder.id },
    data: { lastSentAt: new Date(), lastDeliveryStatus: status, active: false },
  });
}

interface ReminderForSummary {
  id: string;
  label: string;
  type: string;
  channel: string;
  scheduledFor: Date | null;
  recurrenceRule: string | null;
  active: boolean;
  locationTrigger: unknown;
}

export function toReminderSummary(reminder: ReminderForSummary): ReminderSummary {
  const location = reminder.locationTrigger as { label?: string } | null;
  return {
    id: reminder.id,
    label: reminder.label,
    type: reminder.type as ReminderSummary["type"],
    channel: reminder.channel as ReminderSummary["channel"],
    scheduledFor: reminder.scheduledFor ? reminder.scheduledFor.toISOString() : null,
    recurrenceRule: reminder.recurrenceRule as ReminderSummary["recurrenceRule"],
    active: reminder.active,
    locationLabel: location?.label ?? null,
  };
}
