import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { dispatchDueReminders } from "@/lib/reminderDispatch";

export const runtime = "nodejs";

// Not session-authenticated — meant to be pinged by an external scheduler
// (Vercel Cron, GitHub Actions, cron-job.org, etc.) on an interval. Fails
// closed if CRON_SECRET isn't configured, so it can never run unauthenticated.
function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = req.headers.get("authorization");
  const provided = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const summary = await dispatchDueReminders();
  return NextResponse.json(summary);
}
