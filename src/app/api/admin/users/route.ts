import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getAllUsers, toAdminUserSummary } from "@/lib/admin";

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

  const users = await getAllUsers(search);
  return NextResponse.json({ users: users.map(toAdminUserSummary) });
}
