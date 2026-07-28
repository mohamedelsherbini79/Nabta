import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { toAdminUserSummary, updateUserRole } from "@/lib/admin";
import { updateUserRoleSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden", message: "Only admins can change user roles." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateUserRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const updated = await updateUserRole(id, parsed.data.role);
  await logAudit({ actorUserId: user.id, action: "ADMIN_USER_ROLE_UPDATE", entityType: "User", entityId: id, metadata: { role: parsed.data.role } });

  return NextResponse.json({ user: toAdminUserSummary(updated) });
}
