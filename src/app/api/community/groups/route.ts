import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getGroupsWithMembership } from "@/lib/community";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const groups = await getGroupsWithMembership(user.id);
  return NextResponse.json({ groups });
}
