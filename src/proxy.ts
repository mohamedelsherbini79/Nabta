import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// The mobile app (and Expo's web preview) calls this API cross-origin, which
// browsers block without CORS headers. Native builds aren't affected, but
// Expo web and any future browser-based client are. Scoped to /api/* only —
// authenticated by each route's own session/bearer check, not by CORS.
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function proxy(req: NextRequest) {
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
  }
  const res = NextResponse.next();
  for (const [key, value] of Object.entries(corsHeaders())) {
    res.headers.set(key, value);
  }
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
