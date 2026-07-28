import { headers } from "next/headers";
import QRCode from "qrcode";
import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getActiveEmergencyCardLink, toEmergencyCardLinkSummary } from "@/lib/emergencyCard";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { EmergencyContactForm } from "@/components/emergency/EmergencyContactForm";
import { EmergencyCardManager } from "@/components/emergency/EmergencyCardManager";

export default async function EmergencyCardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const link = await getActiveEmergencyCardLink(profile.id);
  const linkSummary = link ? toEmergencyCardLinkSummary(link) : null;

  let publicUrl: string | null = null;
  let qrDataUrl: string | null = null;
  if (linkSummary) {
    const headerList = await headers();
    const host = headerList.get("host");
    const protocol = host?.startsWith("localhost") ? "http" : "https";
    publicUrl = `${protocol}://${host}/emergency/${linkSummary.token}`;
    qrDataUrl = await QRCode.toDataURL(publicUrl, { margin: 1, width: 240 });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="emergencyCard.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="emergencyCard.subtitle" />
        </p>
      </div>

      <EmergencyContactForm
        patientProfileId={profile.id}
        initialName={profile.emergencyContactName}
        initialPhone={profile.emergencyContactPhone}
      />

      <EmergencyCardManager patientProfileId={profile.id} activeLink={linkSummary} publicUrl={publicUrl} qrDataUrl={qrDataUrl} />
    </div>
  );
}
