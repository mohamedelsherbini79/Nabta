import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { attachPaymentSession, finalizeCheckoutFailure, getOrderById, initiateCheckout, toCartSummary } from "@/lib/pharmacy";
import { paymentProvider, PaymentGatewayNotConfiguredError } from "@/lib/payments";
import { pharmacyDeliveryAddressSchema } from "@/lib/validation";

export const runtime = "nodejs";

function clientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "127.0.0.1";
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const patientProfileId: string | undefined = body?.patientProfileId;
  const orderId: string | undefined = body?.orderId;
  if (!patientProfileId || !orderId) {
    return NextResponse.json(
      { error: "invalid_input", message: "patientProfileId and orderId are required." },
      { status: 400 },
    );
  }

  // deliveryAddress is required for a fresh CART checkout, but omitted when
  // retrying payment on an already-addressed PAYMENT_FAILED order.
  let deliveryAddress;
  if (body?.deliveryAddress !== undefined) {
    const parsed = pharmacyDeliveryAddressSchema.safeParse(body.deliveryAddress);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    deliveryAddress = parsed.data;
  }

  const allowed = await canAccessProfile(user.id, patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  const existingOrder = await getOrderById(orderId);
  if (!existingOrder || existingOrder.patientProfileId !== patientProfileId) {
    return NextResponse.json({ error: "not_found", message: "Cart not found." }, { status: 404 });
  }

  const order = await initiateCheckout(orderId, deliveryAddress);
  if (!order) {
    return NextResponse.json(
      { error: "invalid_input", message: "Cart is empty, missing a delivery address, or already checked out." },
      { status: 400 },
    );
  }

  const total = toCartSummary(order).total;
  const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const address = order.deliveryAddress as unknown as { addressLine: string; city: string; phone: string };

  let session;
  try {
    session = await paymentProvider.createPaymentSession({
      orderId: order.id,
      amount: total,
      currency: "EGP",
      customerName: user.name ?? user.email ?? "Patient",
      customerEmail: user.email ?? "",
      customerPhone: address.phone,
      customerIp: clientIp(req),
      addressLine: address.addressLine,
      city: address.city,
      callbackUrl: `${appBaseUrl}/api/pharmacy/checkout/callback`,
      returnUrl: `${appBaseUrl}/pharmacy/checkout/return?orderId=${order.id}`,
    });
  } catch (err) {
    // The order already moved to AWAITING_PAYMENT in initiateCheckout — revert
    // it to PAYMENT_FAILED so the delivery address is preserved and the
    // "Retry payment" action in order history can pick it back up.
    await finalizeCheckoutFailure(order.id);

    if (err instanceof PaymentGatewayNotConfiguredError) {
      return NextResponse.json(
        { error: "gateway_not_configured", message: "Payment gateway is not configured yet." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "gateway_error", message: "Could not start payment. Please try again." }, { status: 502 });
  }

  await attachPaymentSession(order.id, "PAYTABS", session.tranRef);

  await logAudit({ actorUserId: user.id, action: "PHARMACY_CHECKOUT_INITIATED", entityType: "PharmacyOrder", entityId: order.id });

  return NextResponse.json({ redirectUrl: session.redirectUrl });
}
