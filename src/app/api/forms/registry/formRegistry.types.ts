/**
 * formRegistry.types.ts
 *
 * Defines the contract that every form config must satisfy to be registered.
 *
 * A registered form config declares everything the backend needs to know about
 * a form in one place:
 *   - Validation rules (replaces the four arrays in constants.ts)
 *   - Email handler (replaces the entry in formHandlers.ts)
 *   - Response message and log shape
 *
 * The frontend (useFormManager, hooks, UI components) is completely unaffected —
 * it continues to work exactly as before. This registry is backend-only.
 *
 * ─── Adding a new form ────────────────────────────────────────────────────────
 *
 * 1. Write the Zod schema in /zod/YourFormSchema.ts
 * 2. Create /api/forms/registry/yourForm.config.ts implementing FormConfig
 * 3. Import and register it in /api/forms/registry/index.ts
 * 4. Build the UI using useFormManager as normal — nothing else changes
 *
 * TypeScript will give you a compile error if any required field is missing
 * from the config. There is nothing else to update.
 */

import type { BatchResult, EmailResult } from "../services/emailQueue";

// ─── Handler types ────────────────────────────────────────────────────────────

export type ReadPdfFileFn = (filename: string) => string | null;

export interface HandlerResult {
  emailsSent: number;
  emailDetails: EmailResult[];
}

export interface FormData {
  attachments?: Array<{
    data?: string; // base64 — used by induction / ICA attachment format
    content?: string; // base64 — used by quote / siteinfo attachment format
    filename: string;
    type: string;
  }>;
  Email?: string;
  Name?: string;
  State?: string;
  [key: string]: unknown;
}

// ─── Validation rule types ────────────────────────────────────────────────────

export interface FormValidationRules {
  /**
   * Required string/primitive fields.
   * Maps to FORM_VALIDATION_RULES in the old constants.ts.
   * Do NOT include: file fields, honeypot (BotField), arrays, or dates.
   */
  requiredFields?: string[];

  /**
   * Array fields that must have at least one entry.
   * Maps to FORM_ARRAY_RULES. Mirrors every z.array().min(1) in the schema.
   */
  arrayFields?: string[];

  /**
   * Date fields that must be present and non-null.
   * Maps to FORM_DATE_RULES. Presence only — range validation is Zod's job.
   */
  dateFields?: string[];

  /**
   * Email fields to validate format on.
   * Maps to EMAIL_FIELDS. Only include fields present in THIS form.
   */
  emailFields?: string[];
}

// ─── Form config — the single registration unit ───────────────────────────────

export interface FormConfig {
  /**
   * Unique lowercase key matching formType used in useFormManager and route.ts.
   * e.g. "contact", "franchise", "ica"
   */
  key: string;

  /** Validation rules. All fields are optional — omit what doesn't apply. */
  validation: FormValidationRules;

  /**
   * Async email handler — sends emails for a synchronous (dev/Vercel) request.
   * Always returns HandlerResult.
   */
  executeEmailsSync: (
    data: FormData,
    readPdfFile: ReadPdfFileFn,
  ) => Promise<HandlerResult>;

  /**
   * Queue handler — fires and forgets for async (production server) mode.
   * Must call queueEmail() internally.
   */
  queueEmails: (data: FormData, readPdfFile: ReadPdfFileFn) => void;

  /** Success message returned to the client on 200. */
  response: string;

  /** Minimal log shape for server-side performance logging. */
  logData: (data: FormData) => object;
}
