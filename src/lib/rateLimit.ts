// In-memory sliding-window rate limiter. The app runs as a single long-lived
// Node process (see .claude/launch.json — `next dev`/`next start`, not
// per-request serverless functions), so a module-level Map survives across
// requests without needing Redis. If this app is later deployed across
// multiple instances/edge functions, swap this for a shared store.

const hits = new Map<string, number[]>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    hits.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return true;
}
