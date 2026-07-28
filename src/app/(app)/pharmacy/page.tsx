import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getOrCreateCart, getOrdersForProfile, toCartSummary, toOrderSummary } from "@/lib/pharmacy";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { PharmacyCart } from "@/components/pharmacy/PharmacyCart";
import { OrderHistoryList } from "@/components/pharmacy/OrderHistoryList";

export default async function PharmacyPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const cart = await getOrCreateCart(profile.id);
  const orders = await getOrdersForProfile(profile.id);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="pharmacy.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="pharmacy.subtitle" />
        </p>
      </div>

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        <TranslatedText k="pharmacy.demoPricingNotice" />
      </div>

      <PharmacyCart patientProfileId={profile.id} cart={toCartSummary(cart)} />

      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="pharmacy.orders.title" />
        </h2>
        <OrderHistoryList patientProfileId={profile.id} orders={orders.map(toOrderSummary)} />
      </section>
    </div>
  );
}
