/**
 * In-memory token-bucket rate limiter.
 *
 * Per-process — survives only while the serverless instance is warm.
 * Provides best-effort defence against rapid-fire abuse from a single
 * authenticated user. For platform-level DDoS, layer Vercel BotID or
 * an edge rate-limiter on top.
 */

type Bucket = { tokens: number; lastRefill: number };
const buckets = new Map<string, Bucket>();

// Periodic GC so the map doesn't grow unbounded across long-lived instances.
const GC_INTERVAL_MS = 5 * 60 * 1000;
const GC_MAX_AGE_MS  = 30 * 60 * 1000;
let lastGc = Date.now();

function gc() {
  const now = Date.now();
  if (now - lastGc < GC_INTERVAL_MS) return;
  lastGc = now;
  for (const [key, bucket] of buckets) {
    if (now - bucket.lastRefill > GC_MAX_AGE_MS) buckets.delete(key);
  }
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 *
 * @param key            unique caller identity (e.g. `paypal-create:${userId}`)
 * @param capacity       max burst size
 * @param refillPerSec   sustained rate
 */
export function rateLimit(
  key:          string,
  capacity:     number,
  refillPerSec: number,
): boolean {
  gc();
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket) {
    buckets.set(key, { tokens: capacity - 1, lastRefill: now });
    return true;
  }

  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens     = Math.min(capacity, bucket.tokens + elapsed * refillPerSec);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) return false;
  bucket.tokens -= 1;
  return true;
}
