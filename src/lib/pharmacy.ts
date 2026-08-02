import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { mockDrugPriceEGP } from "@/lib/pharmacyPricing";
import type { PharmacyDeliveryAddressInput } from "@/lib/validation";
import type { PharmacyCartItemSummary, PharmacyCartSummary, PharmacyOrderSummary } from "@/types";

const ORDER_INCLUDE = {
  items: { include: { drugCatalog: true } },
} as const;

export function getCart(patientProfileId: string) {
  return prisma.pharmacyOrder.findFirst({
    where: { patientProfileId, status: "CART" },
    include: ORDER_INCLUDE,
  });
}

export async function getOrCreateCart(patientProfileId: string) {
  const existing = await getCart(patientProfileId);
  if (existing) return existing;
  return prisma.pharmacyOrder.create({
    data: { patientProfileId, status: "CART" },
    include: ORDER_INCLUDE,
  });
}

export async function addItemToCart(patientProfileId: string, drugCatalogId: string, quantity: number) {
  const cart = await getOrCreateCart(patientProfileId);
  const existingItem = cart.items.find((item) => item.drugCatalogId === drugCatalogId);

  if (existingItem) {
    await prisma.pharmacyOrderItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    await prisma.pharmacyOrderItem.create({
      data: {
        pharmacyOrderId: cart.id,
        drugCatalogId,
        quantity,
        unitPrice: mockDrugPriceEGP(drugCatalogId),
      },
    });
  }

  return getCart(patientProfileId);
}

export function updateCartItemQuantity(itemId: string, quantity: number) {
  return prisma.pharmacyOrderItem.update({ where: { id: itemId }, data: { quantity } });
}

export function removeCartItem(itemId: string) {
  return prisma.pharmacyOrderItem.delete({ where: { id: itemId } });
}

export function getOrderItemWithOrder(itemId: string) {
  return prisma.pharmacyOrderItem.findUnique({
    where: { id: itemId },
    include: { pharmacyOrder: true },
  });
}

export function getOrdersForProfile(patientProfileId: string) {
  return prisma.pharmacyOrder.findMany({
    where: { patientProfileId, status: { not: "CART" } },
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

export function getOrderById(id: string) {
  return prisma.pharmacyOrder.findUnique({ where: { id }, include: ORDER_INCLUDE });
}

function orderTotal(items: { unitPrice: Prisma.Decimal; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
}

// Moves an order into AWAITING_PAYMENT ahead of creating a gateway payment
// session. Accepts a CART order (first checkout, deliveryAddress required) or
// a PAYMENT_FAILED order (retry, reuses the previously stored deliveryAddress
// when none is passed).
export async function initiateCheckout(orderId: string, deliveryAddress?: PharmacyDeliveryAddressInput) {
  const order = await getOrderById(orderId);
  if (!order || order.items.length === 0) return null;
  if (order.status !== "CART" && order.status !== "PAYMENT_FAILED") return null;

  const address = deliveryAddress ?? (order.deliveryAddress as unknown as PharmacyDeliveryAddressInput | null);
  if (!address) return null;

  return prisma.pharmacyOrder.update({
    where: { id: orderId },
    data: {
      status: "AWAITING_PAYMENT",
      deliveryAddress: address as unknown as Prisma.InputJsonValue,
    },
    include: ORDER_INCLUDE,
  });
}

export function attachPaymentSession(orderId: string, provider: string, tranRef: string) {
  return prisma.pharmacyOrder.update({
    where: { id: orderId },
    data: { paymentProvider: provider, paymentRef: tranRef },
    include: ORDER_INCLUDE,
  });
}

// `tranRef` must be the PayTabs transaction the caller has independently
// confirmed as PAID. We only trust it if it matches the ref this order's own
// checkout session stored (`attachPaymentSession`) — otherwise a real PAID
// tran_ref from an unrelated (e.g. cheaper) order could be replayed against
// this one to mark it paid for free. The status transition is also done as a
// single conditional update so two concurrent finalize calls (webhook +
// return-page fallback both landing at once) can't both pass the guard and
// create two expense records for the same order.
export async function finalizeCheckoutSuccess(orderId: string, tranRef: string) {
  const order = await getOrderById(orderId);
  if (!order || order.status !== "AWAITING_PAYMENT") return null;
  if (!order.paymentRef || order.paymentRef !== tranRef) return null;

  const total = orderTotal(order.items);

  const result = await prisma.pharmacyOrder.updateMany({
    where: { id: orderId, status: "AWAITING_PAYMENT" },
    data: { status: "PLACED" },
  });
  if (result.count === 0) return null;

  await prisma.expenseRecord.create({
    data: {
      patientProfileId: order.patientProfileId,
      category: "MEDICATION",
      amount: total,
      currency: "EGP",
      note: "Pharmacy order",
      relatedPharmacyOrderId: order.id,
    },
  });

  return getOrderById(orderId);
}

export function finalizeCheckoutFailure(orderId: string) {
  return prisma.pharmacyOrder.update({
    where: { id: orderId },
    data: { status: "PAYMENT_FAILED" },
    include: ORDER_INCLUDE,
  });
}

export function cancelOrder(id: string) {
  return prisma.pharmacyOrder.update({ where: { id }, data: { status: "CANCELLED" } });
}

interface OrderItemForSummary {
  id: string;
  drugCatalogId: string | null;
  drugCatalog: { tradeName: string } | null;
  quantity: number;
  unitPrice: Prisma.Decimal;
}

function toCartItemSummary(item: OrderItemForSummary): PharmacyCartItemSummary {
  return {
    id: item.id,
    drugCatalogId: item.drugCatalogId ?? "",
    tradeName: item.drugCatalog?.tradeName ?? "—",
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
  };
}

interface OrderForSummary {
  id: string;
  items: OrderItemForSummary[];
}

export function toCartSummary(order: OrderForSummary): PharmacyCartSummary {
  return {
    id: order.id,
    items: order.items.map(toCartItemSummary),
    total: orderTotal(order.items),
  };
}

interface FullOrderForSummary extends OrderForSummary {
  status: string;
  createdAt: Date;
}

export function toOrderSummary(order: FullOrderForSummary): PharmacyOrderSummary {
  return {
    id: order.id,
    status: order.status as PharmacyOrderSummary["status"],
    items: order.items.map(toCartItemSummary),
    total: orderTotal(order.items),
    createdAt: order.createdAt.toISOString(),
  };
}
