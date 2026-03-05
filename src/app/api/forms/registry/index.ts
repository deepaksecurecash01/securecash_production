/**
 * formRegistry/index.ts
 *
 * The single source of truth for all registered forms.
 *
 * ─── How it works ─────────────────────────────────────────────────────────────
 *
 * Each form has its own config file in this directory. Import it here and add
 * it to REGISTRY. Everything downstream (route.ts, validation.ts) reads from
 * the derived exports — nothing else needs updating.
 *
 * ─── To register a new form ───────────────────────────────────────────────────
 *
 * 1. Create ./yourForm.config.ts implementing FormConfig
 * 2. Import it below and add it to REGISTRY
 * 3. Done — validation rules and handler are registered automatically
 *
 * TypeScript will error at compile time if any required FormConfig field
 * is missing. There is no silent failure.
 */

import type { FormConfig } from "./formRegistry.types";

// ─── Import all form configs ──────────────────────────────────────────────────

import { contactConfig } from "./contact.config";
import { franchiseConfig } from "./franchise.config";
import { austracConfig } from "./austrac.config";
import { termsConfig } from "./terms.config";
import { quoteConfig } from "./quote.config";
import { siteInfoConfig } from "./siteInfo.config";
import { specialEventConfig } from "./specialEvent.config";
import { icaConfig } from "./ica.config";
import { inductionConfig } from "./induction.config";

// ─── Registry ─────────────────────────────────────────────────────────────────

const REGISTRY: FormConfig[] = [
  contactConfig,
  franchiseConfig,
  austracConfig,
  termsConfig,
  quoteConfig,
  siteInfoConfig,
  specialEventConfig,
  icaConfig,
  inductionConfig,
];

// ─── Derived exports ──────────────────────────────────────────────────────────
// These replace the scattered arrays in constants.ts and the FORM_HANDLERS
// object in formHandlers.ts. route.ts and validation.ts import from here.

/**
 * Handler map — replaces FORM_HANDLERS in formHandlers.ts.
 * Keyed by lowercase formType string.
 */
export const FORM_HANDLERS = Object.fromEntries(
  REGISTRY.map((config) => [
    config.key,
    {
      executeEmailsSync: config.executeEmailsSync,
      queueEmails: config.queueEmails,
      response: config.response,
      logData: config.logData,
    },
  ]),
);

/**
 * Validation rule maps — replace the four arrays in constants.ts.
 * Consumed directly by validation.ts.
 */
export const FORM_VALIDATION_RULES = Object.fromEntries(
  REGISTRY.map((c) => [c.key, c.validation.requiredFields ?? []]),
);

export const FORM_ARRAY_RULES = Object.fromEntries(
  REGISTRY.map((c) => [c.key, c.validation.arrayFields ?? []]),
);

export const FORM_DATE_RULES = Object.fromEntries(
  REGISTRY.map((c) => [c.key, c.validation.dateFields ?? []]),
);

/**
 * EMAIL_FIELDS — union of all email fields across all registered forms.
 * Deduped. Replaces the hardcoded EMAIL_FIELDS array in constants.ts.
 */
export const EMAIL_FIELDS: string[] = [
  ...new Set(REGISTRY.flatMap((c) => c.validation.emailFields ?? [])),
];
