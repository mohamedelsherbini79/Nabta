import { NextResponse } from "next/server";
import { finalizeCheckoutFailure, finalizeCheckoutSuccess } from "@/lib/pharmacy";
import { paymentProvider } from "@/lib/payments";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

// PayTabs server-to-server webhook. Not session-authenticated — anyone could
// POST here, so the incoming payload's status is never trusted directly; we
// re-query PayTabs with the tran_ref to get an authoritative result.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const orderId: string | undefined = body?.cart_id;
  const tranRef: string | undefined = body?.tran_ref;

  if (!orderId || !tranRef) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  let status;
  try {
    status = await paymentProvider.queryTransaction(tranRef);
  } catch {
    // PayTabs will retry the webhook; ask it to try again later.
    return NextResponse.json({ error: "query_failed" }, { status: 502 });
  }

  if (status === "PAID") {
    const order = await finalizeCheckoutSuccess(orderId);
    if (order) {
      await logAudit({ action: "PHARMACY_PAYMENT_CONFIRMED", entityType: "PharmacyOrder", entityId: orderId });
    }
  } else if (status === "FAILED") {
    const order = await finalizeCheckoutFailure(orderId);
    if (order) {
      await logAudit({ action: "PHARMACY_PAYMENT_FAILED", entityType: "PharmacyOrder", entityId: orderId });
    }
  }
  // PENDING: leave the order in AWAITING_PAYMENT; PayTabs will call back again.

  return NextResponse.json({ ok: true });
}
