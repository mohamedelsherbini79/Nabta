import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { addItemToCart, toCartSummary } from "@/lib/pharmacy";
import { getCountryFromCookies } from "@/country/getCountryServer";
import { pharmacyCartItemSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = pharmacyCartItemSchema.safeParse(body);
  const patientProfileId: string | undefined = body?.patientProfileId;
  if (!parsed.success || !patientProfileId) {
    return NextResponse.json(
      {
        error: "invalid_input",
        message: parsed.success ? "patientProfileId is required." : (parsed.error.issues[0]?.message ?? "Invalid input"),
      },
      { status: 400 },
    );
  }

  const allowed = await canAccessProfile(user.id, patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Profile not found." }, { status: 404 });
  }

  const country = await getCountryFromCookies();
  const cart = await addItemToCart(patientProfileId, parsed.data.drugCatalogId, parsed.data.quantity, country);
  if (!cart) {
    return NextResponse.json({ error: "not_found", message: "Cart not found." }, { status: 404 });
  }

  await logAudit({ actorUserId: user.id, action: "PHARMACY_CART_ITEM_ADD", entityType: "PharmacyOrder", entityId: cart.id });

  return NextResponse.json({ cart: toCartSummary(cart) }, { status: 201 });
}
