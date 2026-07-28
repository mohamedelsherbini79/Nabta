import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { deleteDrug, toAdminDrugSummary, updateDrug } from "@/lib/admin";
import { adminDrugSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden", message: "Only admins can edit drugs." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = adminDrugSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const drug = await updateDrug(id, parsed.data);
  await logAudit({ actorUserId: user.id, action: "ADMIN_DRUG_UPDATE", entityType: "DrugCatalog", entityId: id });

  return NextResponse.json({ drug: toAdminDrugSummary(drug) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden", message: "Only admins can delete drugs." }, { status: 403 });
  }

  const { id } = await params;
  const result = await deleteDrug(id);
  if (!result.ok) {
    return NextResponse.json({ error: "in_use", message: result.error }, { status: 409 });
  }

  await logAudit({ actorUserId: user.id, action: "ADMIN_DRUG_DELETE", entityType: "DrugCatalog", entityId: id });

  return NextResponse.json({ success: true });
}
