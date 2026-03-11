import { z } from "zod";
import { CommonValidations } from "./validationHelpers";

// ─── SCHEMA ───────────────────────────────────────────────────────────────────

export const TermsFormSchema = z.object({
  FullName: CommonValidations.fullName(),

  Position: z
    .string()
    .min(2, "Position must be at least 2 characters long.")
    .max(100, "Position is too long (maximum 100 characters)."),

  Email: CommonValidations.email("Email address"),

  Birthdate: CommonValidations.birthdate(13, 150)
    .optional()
    .refine((date) => date !== undefined, "Date of Birth is required."),

  Organisation: z
    .string()
    .min(2, "Organisation name must be at least 2 characters long.")
    .max(200, "Organisation name is too long (maximum 200 characters).")
    .refine(
      (org) => /[A-Za-z]/.test(org.trim()),
      "Organisation name must contain at least one letter.",
    ),

  ABN: CommonValidations.abn(),

  Signature: z
    .string({
      errorMap: () => ({ message: "Signature is required." }),
    })
    .min(1, "Signature is required."),
  // Honeypot field for bot detection. Always present, always empty.
  BotField: CommonValidations.botField(),
});

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type TermsFormData = z.infer<typeof TermsFormSchema>;

// TermsFormInput automatically includes Birthdate: Date | null because
// .nullable() is in the schema. No Omit pattern needed.
export type TermsFormInput = z.input<typeof TermsFormSchema>;

// ─── DEFAULT VALUES ───────────────────────────────────────────────────────────

// Birthdate is null on load — the date picker has no initial selection.
export const TERMS_DEFAULT_VALUES: TermsFormInput = {
  FullName: "",
  Position: "",
  Email: "",
  Birthdate: undefined,
  Organisation: "",
  ABN: "",
  Signature: "",
  BotField: "",
};

// ─── FIELD PRIORITY ───────────────────────────────────────────────────────────
// Used by scroll-to-first-error logic to focus fields in the correct order.
// BotField intentionally excluded — honeypot field, should never receive focus.

export const TERMS_FIELD_PRIORITY: Array<keyof TermsFormData> = [
  "FullName",
  "Position",
  "Email",
  "Birthdate",
  "Organisation",
  "ABN",
  "Signature",
];
