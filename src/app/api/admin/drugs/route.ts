import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { createDrug, getAllDrugsAdmin, toAdminDrugSummary } from "@/lib/admin";
import { adminDrugSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden", message: "Admin access required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") ?? undefined;

  const drugs = await getAllDrugsAdmin(search);
  return NextResponse.json({ drugs: drugs.map(toAdminDrugSummary) });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden", message: "Only admins can add drugs." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = adminDrugSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const drug = await createDrug(parsed.data);
  await logAudit({ actorUserId: user.id, action: "ADMIN_DRUG_CREATE", entityType: "DrugCatalog", entityId: drug.id });

  return NextResponse.json({ drug: toAdminDrugSummary(drug) }, { status: 201 });
}
