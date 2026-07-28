import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { getCart, getOrderItemWithOrder, removeCartItem, toCartSummary, updateCartItemQuantity } from "@/lib/pharmacy";
import { pharmacyQuantitySchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const item = await getOrderItemWithOrder(id);
  if (!item || item.pharmacyOrder.status !== "CART") {
    return NextResponse.json({ error: "not_found", message: "Cart item not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, item.pharmacyOrder.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Cart item not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = pharmacyQuantitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  await updateCartItemQuantity(id, parsed.data.quantity);
  const cart = await getCart(item.pharmacyOrder.patientProfileId);
  await logAudit({ actorUserId: user.id, action: "PHARMACY_CART_ITEM_UPDATE", entityType: "PharmacyOrderItem", entityId: id });

  return NextResponse.json({ cart: cart ? toCartSummary(cart) : null });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const item = await getOrderItemWithOrder(id);
  if (!item || item.pharmacyOrder.status !== "CART") {
    return NextResponse.json({ error: "not_found", message: "Cart item not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, item.pharmacyOrder.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Cart item not found." }, { status: 404 });
  }

  await removeCartItem(id);
  const cart = await getCart(item.pharmacyOrder.patientProfileId);
  await logAudit({ actorUserId: user.id, action: "PHARMACY_CART_ITEM_REMOVE", entityType: "PharmacyOrderItem", entityId: id });

  return NextResponse.json({ cart: cart ? toCartSummary(cart) : null });
}
