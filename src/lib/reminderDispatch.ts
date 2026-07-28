import { prisma } from "@/lib/prisma";
import { getDueReminders, markReminderProcessed } from "@/lib/reminders";
import { notificationProvider } from "@/lib/twilio";

// SELF profiles have their own userId; dependents (children, elderly parents)
// don't, so their reminders fall back to whoever manages the family group.
export async function resolveReminderPhone(patientProfileId: string): Promise<string | null> {
  const profile = await prisma.patientProfile.findUnique({
    where: { id: patientProfileId },
    include: { familyGroup: { include: { headUser: true } } },
  });
  if (!profile) return null;

  if (profile.userId) {
    const owner = await prisma.user.findUnique({ where: { id: profile.userId } });
    if (owner?.phone) return owner.phone;
  }

  return profile.familyGroup.headUser.phone ?? null;
}

export interface DispatchSummary {
  processed: number;
  sent: number;
  skipped: number;
  failed: number;
}

export async function dispatchDueReminders(): Promise<DispatchSummary> {
  const due = await getDueReminders();
  const summary: DispatchSummary = { processed: 0, sent: 0, skipped: 0, failed: 0 };

  for (const reminder of due) {
    summary.processed += 1;

    if (reminder.channel === "PUSH") {
      // Not implemented yet (needs device-token registration + a push service) —
      // tick it forward so it stops reappearing as due, without claiming it sent.
      await markReminderProcessed(reminder, "SKIPPED_UNSUPPORTED");
      summary.skipped += 1;
      continue;
    }

    const phone = await resolveReminderPhone(reminder.patientProfileId);
    if (!phone) {
      await markReminderProcessed(reminder, "SKIPPED_NO_PHONE");
      summary.skipped += 1;
      continue;
    }

    try {
      if (reminder.channel === "VOICE") {
        await notificationProvider.makeVoiceCall(phone, reminder.label);
      } else {
        await notificationProvider.sendSms(phone, reminder.label);
      }
      await markReminderProcessed(reminder, "SENT");
      summary.sent += 1;
    } catch (err) {
      console.error(`Reminder ${reminder.id} dispatch failed:`, err);
      await markReminderProcessed(reminder, "FAILED");
      summary.failed += 1;
    }
  }

  return summary;
}
