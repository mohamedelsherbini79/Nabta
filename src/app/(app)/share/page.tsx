import { headers } from "next/headers";
import QRCode from "qrcode";
import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getActiveDoctorShareLinks, toDoctorShareLinkSummary } from "@/lib/doctorShare";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { DoctorShareManager, type DoctorShareLinkWithQr } from "@/components/share/DoctorShareManager";

export default async function ShareProfilePage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const links = await getActiveDoctorShareLinks(profile.id);

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";

  const activeLinks: DoctorShareLinkWithQr[] = [];
  for (const link of links) {
    const summary = toDoctorShareLinkSummary(link);
    const publicUrl = `${protocol}://${host}/share/${summary.token}`;
    const qrDataUrl = await QRCode.toDataURL(publicUrl, { margin: 1, width: 200 });
    activeLinks.push({ link: summary, publicUrl, qrDataUrl });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="shareProfile.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="shareProfile.subtitle" />
        </p>
      </div>

      <DoctorShareManager patientProfileId={profile.id} activeLinks={activeLinks} />
    </div>
  );
}
