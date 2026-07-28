import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessProfile } from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { deleteExpenseRecord } from "@/lib/expenses";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const record = await prisma.expenseRecord.findUnique({ where: { id } });
  if (!record) {
    return NextResponse.json({ error: "not_found", message: "Expense not found." }, { status: 404 });
  }

  const allowed = await canAccessProfile(user.id, record.patientProfileId);
  if (!allowed) {
    return NextResponse.json({ error: "not_found", message: "Expense not found." }, { status: 404 });
  }

  await deleteExpenseRecord(id);
  await logAudit({ actorUserId: user.id, action: "EXPENSE_DELETE", entityType: "ExpenseRecord", entityId: id });

  return NextResponse.json({ success: true });
}
