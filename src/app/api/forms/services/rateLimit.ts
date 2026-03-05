import { RATE_LIMIT_WINDOW, RATE_LIMIT_MAX } from "../config/constants";

const RATE_LIMIT_MAP = new Map<string, number[]>();

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export const checkRateLimit = (req: Request): RateLimitResult => {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  if (!RATE_LIMIT_MAP.has(ip)) {
    RATE_LIMIT_MAP.set(ip, []);
  }

  // Non-null assertion is safe: we just set the entry above if it was missing.
  const requests = RATE_LIMIT_MAP.get(ip)!;

  while (requests.length > 0 && requests[0] < windowStart) {
    requests.shift();
  }

  if (requests.length >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  requests.push(now);

  return { allowed: true, remaining: RATE_LIMIT_MAX - requests.length };
};

const cleanupRateLimits = (): void => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  for (const [ip, requests] of RATE_LIMIT_MAP.entries()) {
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }
    if (requests.length === 0) {
      RATE_LIMIT_MAP.delete(ip);
    }
  }
};

setInterval(cleanupRateLimits, RATE_LIMIT_WINDOW);

// Return type is inferred — no annotation needed, and an explicit one would
// break if a non-number field is ever added to this object.
export const getRateLimitInfo = () => ({
  windowMinutes: RATE_LIMIT_WINDOW / 60000,
  maxPerWindow: RATE_LIMIT_MAX,
  activeIPs: RATE_LIMIT_MAP.size,
});
