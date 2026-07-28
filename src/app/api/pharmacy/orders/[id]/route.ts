import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { cancelOrder, getOrderById, toOrderSummary } from "@/lib/pharmacy";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "not_found", message: "Order not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, order.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Order not found." }, { status: 404 });
  }

  if (order.status !== "PLACED") {
    return NextResponse.json(
      { error: "invalid_state", message: "Only orders that are still Placed can be cancelled." },
      { status: 400 },
    );
  }

  const updated = await cancelOrder(id);
  await logAudit({ actorUserId: user.id, action: "PHARMACY_ORDER_CANCEL", entityType: "PharmacyOrder", entityId: id });

  return NextResponse.json({ order: toOrderSummary({ ...updated, items: order.items }) });
}
