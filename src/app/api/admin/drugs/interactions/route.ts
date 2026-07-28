import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { createDrugInteraction, toAdminDrugInteractionSummary } from "@/lib/admin";
import { drugInteractionSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden", message: "Only admins can add interactions." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = drugInteractionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const interaction = await createDrugInteraction(parsed.data);
  await logAudit({ actorUserId: user.id, action: "ADMIN_DRUG_INTERACTION_CREATE", entityType: "DrugInteraction", entityId: interaction.id });

  return NextResponse.json({ interaction: toAdminDrugInteractionSummary(interaction) }, { status: 201 });
}
