import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { deleteDrugInteraction } from "@/lib/admin";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden", message: "Only admins can remove interactions." }, { status: 403 });
  }

  const { id } = await params;
  await deleteDrugInteraction(id);
  await logAudit({ actorUserId: user.id, action: "ADMIN_DRUG_INTERACTION_DELETE", entityType: "DrugInteraction", entityId: id });

  return NextResponse.json({ success: true });
}
