import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { finalizeCheckoutFailure, finalizeCheckoutSuccess, getOrderById } from "@/lib/pharmacy";
import { paymentProvider } from "@/lib/payments";
import { TranslatedText } from "@/components/i18n/TranslatedText";

export default async function PharmacyCheckoutReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const user = await getSessionUser();
  if (!user || !orderId) return null;

  let order = await getOrderById(orderId);
  if (!order) return null;

  const allowed = await canAccessProfile(user.id, order.patientProfileId);
  if (!allowed) return null;

  // The webhook is the primary path, but it can't reach a local dev server
  // and may simply not have landed yet — fall back to querying PayTabs
  // directly so this page always reflects the real outcome.
  if (order.status === "AWAITING_PAYMENT" && order.paymentRef) {
    try {
      const status = await paymentProvider.queryTransaction(order.paymentRef);
      if (status === "PAID") {
        order = (await finalizeCheckoutSuccess(order.id)) ?? order;
      } else if (status === "FAILED") {
        order = (await finalizeCheckoutFailure(order.id)) ?? order;
      }
    } catch {
      // Leave the order as-is; the user can check order history later once
      // the webhook (or a future visit here) resolves it.
    }
  }

  const success = order.status === "PLACED";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center sm:p-6">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        <TranslatedText k="pharmacy.checkoutReturn.title" />
      </h1>
      <p className={`text-sm ${success ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
        <TranslatedText k={success ? "pharmacy.checkoutReturn.success" : "pharmacy.checkoutReturn.failure"} />
      </p>
      <Link href="/pharmacy" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
        <TranslatedText k="pharmacy.checkoutReturn.backToPharmacy" />
      </Link>
    </div>
  );
}
