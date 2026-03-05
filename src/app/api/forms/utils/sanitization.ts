/**
 * Input sanitization utilities for untrusted form data.
 *
 * Strategy: DETECT then REJECT — never silently strip.
 *
 * Silently stripping HTML (e.g. "<abc>" → "") is dangerous because it can turn
 * a non-empty field into an empty one, bypassing .min(1) validators downstream
 * without any error surfacing to the caller. A user who submits "<abc>" in a
 * Position field would get a silent blank in the email with a 200 response.
 *
 * Instead:
 *   containsInjection()  — returns true if a string contains HTML/script vectors
 *   scanFormData()       — walks the payload and returns the first offending field
 *   sanitizeFormData()   — call scanFormData() first; if clean, normalises whitespace
 *                          only (trim). No character stripping.
 *
 * Usage in route.ts:
 *
 *   const { formType, ...rawData } = await req.json();
 *   const scan = scanFormData(rawData);
 *   if (scan) {
 *     return NextResponse.json(
 *       { error: "Bad request", field: scan.field, reason: scan.reason },
 *       { status: 400 },
 *     );
 *   }
 *   const formData = sanitizeFormData({ ...rawData, "IP Address": ipAddress });
 *
 * Fields that are intentionally non-string (arrays, File objects, booleans,
 * numbers) are passed through untouched. Attachment content (base64) is
 * deliberately excluded — it is validated separately by size/type checks
 * in validation.ts and must not be string-transformed.
 */

// ─── Fields that must never be scanned or sanitized ──────────────────────────
// Attachment content is base64-encoded binary. Scanning it for angle brackets
// would produce false positives, and sanitizing it would corrupt the payload.

const SKIP_FIELDS = new Set(["content"]);

// ─── Injection detection ──────────────────────────────────────────────────────

/**
 * Matches HTML tags precisely — requires < immediately followed by a letter or /
 * so that legitimate comparisons like "price < cost" or "< 10 employees" are
 * not flagged, while <abc>, <script>, </div>, <b>bold</b> are all caught.
 */
const HTML_TAG_PATTERN = /<\/?[a-zA-Z][^>]*>/i;

/**
 * Matches non-tag injection vectors that don't rely on angle brackets:
 *   - javascript: URI scheme
 *   - Inline event handlers (onclick=, onload=, onerror=, etc.)
 *   - data:text/html URIs
 *   - Null bytes
 */
const OTHER_INJECTION_PATTERN = /javascript:|on\w+\s*=|data:text\/html|\0/i;

/**
 * Returns true if the string contains any HTML or script injection vector.
 * Used by scanFormData() to decide whether to reject the entire request.
 */
export const containsInjection = (str: string): boolean =>
  HTML_TAG_PATTERN.test(str) || OTHER_INJECTION_PATTERN.test(str);

// ─── Scan result type ─────────────────────────────────────────────────────────

export interface InjectionScanResult {
  /** Dot-path of the first offending field (e.g. "Position" or "contacts.0.name") */
  field: string;
  /** Human-readable reason, safe to include in a 400 response */
  reason: string;
}

// ─── Recursive payload scanner ────────────────────────────────────────────────

type SanitizableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | SanitizableValue[]
  | { [key: string]: SanitizableValue };

/**
 * Recursively walks the form payload and returns the first field that contains
 * an injection vector, or null if the payload is clean.
 *
 * Call this BEFORE sanitizeFormData(). If it returns a result, reject the
 * request with 400 immediately — do not proceed to validation or handlers.
 */
export const scanFormData = <T extends Record<string, SanitizableValue>>(
  data: T,
): InjectionScanResult | null => {
  const scan = (
    value: SanitizableValue,
    path: string,
  ): InjectionScanResult | null => {
    const key = path.split(".").pop() ?? "";
    if (SKIP_FIELDS.has(key)) return null;

    if (typeof value === "string") {
      if (containsInjection(value)) {
        return {
          field: path,
          reason: "Field contains invalid characters or markup.",
        };
      }
      return null;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const result = scan(value[i], `${path}.${i}`);
        if (result) return result;
      }
      return null;
    }

    if (value !== null && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) {
        if (SKIP_FIELDS.has(k)) continue;
        const result = scan(v, path ? `${path}.${k}` : k);
        if (result) return result;
      }
      return null;
    }

    return null;
  };

  for (const [key, value] of Object.entries(data)) {
    if (SKIP_FIELDS.has(key)) continue;
    const result = scan(value, key);
    if (result) return result;
  }

  return null;
};

// ─── Whitespace normaliser ────────────────────────────────────────────────────

/**
 * Normalises a clean string — trims leading/trailing whitespace only.
 * Does NOT strip any characters. If the string contains injection vectors,
 * scanFormData() should have caught it before this is called.
 */
const normalise = (str: string): string => str.trim();

// ─── Recursive form data sanitizer ───────────────────────────────────────────

/**
 * Recursively walks a clean form data object and normalises all string fields
 * (trim only). Skips fields in SKIP_FIELDS.
 *
 * IMPORTANT: Always call scanFormData() first. This function assumes the
 * payload is already clean and does NOT detect or strip injection vectors.
 *
 * Returns a new object — the original is not mutated.
 */
export const sanitizeFormData = <T extends Record<string, SanitizableValue>>(
  data: T,
): T => {
  const process = (value: SanitizableValue, key?: string): SanitizableValue => {
    if (key !== undefined && SKIP_FIELDS.has(key)) return value;

    if (typeof value === "string") return normalise(value);

    if (Array.isArray(value)) {
      return value.map((item) => process(item));
    }

    if (value !== null && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, process(v, k)]),
      ) as { [key: string]: SanitizableValue };
    }

    return value;
  };

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, process(value, key)]),
  ) as T;
};
