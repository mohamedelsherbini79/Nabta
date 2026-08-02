import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// The mobile app (and Expo's web preview) calls this API cross-origin, which
// browsers block without CORS headers. Native builds aren't affected, but
// Expo web and any future browser-based client are. Scoped to /api/* only —
// authenticated by each route's own session/bearer check, not by CORS.
//
// Never add "Access-Control-Allow-Credentials: true" alongside a reflected/
// wildcard origin — that combination would let any site read cookie-session
// responses cross-origin. If CORS_ALLOWED_ORIGINS is unset we default to "*"
// (today's behavior, since native clients ignore CORS and no credentials
// header is sent), but set CORS_ALLOWED_ORIGINS (comma-separated) in
// production to lock this down to known app/Expo origins.
function corsHeaders(origin: string | null) {
  const allowlist = process.env.CORS_ALLOWED_ORIGINS?.split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const allowOrigin = !allowlist || allowlist.length === 0 ? "*" : origin && allowlist.includes(origin) ? origin : "null";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

export function proxy(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
  }
  const res = NextResponse.next();
  for (const [key, value] of Object.entries(corsHeaders(origin))) {
    res.headers.set(key, value);
  }
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
