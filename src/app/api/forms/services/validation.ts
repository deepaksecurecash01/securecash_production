import {
  FORM_VALIDATION_RULES,
  FORM_ARRAY_RULES,
  FORM_DATE_RULES,
  EMAIL_FIELDS,
} from "../registry";
import { isValidEmail } from "../utils/Helpers";

// ─── Constants ────────────────────────────────────────────────────────────────
// Declared before validateFormData so MAX_ATTACHMENT_SIZE is in scope.

export const RATE_LIMIT_WINDOW: number = 60 * 1000;
export const RATE_LIMIT_MAX: number = 10;

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export const RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 16000,
  backoffFactor: 4,
};

export const MAX_ATTACHMENT_SIZE: number = 5 * 1024 * 1024;

export const PDF_FILES_TO_CACHE: string[] = [
  "ACCC-Information-Statement.pdf",
  "SecureCash-Franchise-Prospectus.pdf",
  "SecureCash-DL-Flyer.pdf",
  "eDockets-DL-Flyer.pdf",
  "Independant Contractors Agreement - Courier Lab.pdf",
  "SecureCash Deed - Courier Lab.pdf",
  "SecureCash-Online-Services-Flyer.pdf",
  "How-to-Prepare-Your-Banking.pdf",
];

export const MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// ─── Types ────────────────────────────────────────────────────────────────────

// index signature uses unknown (not any) — callers must narrow before use
interface Attachment {
  content?: string;
  filename?: string;
  [key: string]: unknown;
}

// index signature uses unknown (not any) — callers must narrow before use
interface FormData {
  attachments?: Attachment[];
  [key: string]: unknown;
}

// ─── Validator ────────────────────────────────────────────────────────────────

/**
 * Validates form data for a given form type against the configured rules.
 *
 * Checks:
 * - All required string/primitive fields are present and non-empty (FORM_VALIDATION_RULES)
 * - All required array fields have at least one entry (FORM_ARRAY_RULES)
 * - All required date fields are present and non-null (FORM_DATE_RULES)
 * - All email fields (if present) pass email format validation
 * - All attachments are within the 5 MB size limit
 *
 * Returns an array of human-readable error strings.
 * An empty array means validation passed.
 */
export const validateFormData = (
  formType: string,
  formData: FormData,
): string[] => {
  const errors: string[] = [];
  const key = formType.toLowerCase();

  // ── String / primitive required fields ───────────────────────────────────
  const requiredFields = FORM_VALIDATION_RULES[key] ?? [];
  requiredFields.forEach((field) => {
    const value = formData[field];
    if (value === undefined || value === null) {
      errors.push(`Missing required field: ${field}`);
    } else if (typeof value === "string" && value.trim().length === 0) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // ── Array fields — must have at least one entry ───────────────────────────
  const arrayFields = FORM_ARRAY_RULES[key] ?? [];
  arrayFields.forEach((field) => {
    const value = formData[field];
    if (!Array.isArray(value) || value.length === 0) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // ── Date fields — must be present and non-null ────────────────────────────
  const dateFields = FORM_DATE_RULES[key] ?? [];
  dateFields.forEach((field) => {
    const value = formData[field];
    if (value === undefined || value === null || value === "") {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // ── Email format validation ───────────────────────────────────────────────
  EMAIL_FIELDS.forEach((field) => {
    const email = formData[field];
    // Only validate if the field is present — required check above handles absence
    if (email !== undefined && email !== null) {
      if (typeof email !== "string" || !isValidEmail(email.trim())) {
        errors.push(`Invalid email format: ${field}`);
      }
    }
  });

  // ── Attachment size validation ────────────────────────────────────────────
  if (formData.attachments && Array.isArray(formData.attachments)) {
    formData.attachments.forEach((attachment, index) => {
      if (typeof attachment.content === "string") {
        const size = Buffer.byteLength(attachment.content, "base64");
        if (size > MAX_ATTACHMENT_SIZE) {
          errors.push(`Attachment ${index + 1} exceeds 5MB limit`);
        }
      }
    });
  }

  return errors;
};
