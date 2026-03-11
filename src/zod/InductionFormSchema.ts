import { z } from "zod";
import {
  ACCEPTED_FILE_TYPES,
  CommonValidations,
  createFileValidation,
} from "./validationHelpers";

// ─── SCHEMA ───────────────────────────────────────────────────────────────────

export const InductionFormSchema = z.object({
  FullName: CommonValidations.fullName(),

  Phone: CommonValidations.phone(10, 15),

  Email: CommonValidations.email("Email address"),

  Address: CommonValidations.address(10),

  // .optional() so z.infer gives File | undefined — matching the undefined
  // default value through useFormManager's DeepPartial typing.
  // .refine() re-enforces required on submission — same pattern as IcaFormSchema
  // (GovernmentID, WitnessID, SecurityLicense, CITInsurance).
  Photo: createFileValidation("Personal Photo", ACCEPTED_FILE_TYPES.images)
    .optional()
    .refine((file) => file !== undefined, "Please upload your personal photo."),

  DriversLicense: createFileValidation(
    "Drivers License",
    ACCEPTED_FILE_TYPES.images,
  )
    .optional()
    .refine(
      (file) => file !== undefined,
      "Please upload your drivers license.",
    ),

  AcceptAgreement: z
    .array(z.string())
    .min(1, "You must accept the confidentiality agreement to continue.")
    .refine(
      (value) => value.includes("accepted"),
      "Agreement acceptance is required.",
    ),

  State: CommonValidations.selectRequired("State"),

  ContractorName: z
    .string()
    .min(2, "Contractor name is required.")
    .max(200, "Contractor name must be less than 200 characters."),

  EdocketUsername: z
    .string()
    .min(4, "Username must be at least 4 characters.")
    .max(50, "Username must be less than 50 characters.")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens.",
    ),

  EdocketPassword: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(50, "Password must be less than 50 characters."),

  // Induction is an authenticated onboarding form — not a public contact form.
  // BotField is intentionally excluded. No honeypot needed for authenticated flows.
});

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type InductionFormData = z.infer<typeof InductionFormSchema>;
export type InductionFormInput = z.input<typeof InductionFormSchema>;

// ─── DEFAULT VALUES ───────────────────────────────────────────────────────────

// Photo and DriversLicense are undefined on load — no file selected yet.
// No Omit needed: .optional() on the file fields makes z.infer give
// File | undefined, which matches useFormManager's DeepPartial<TFormData>.
// .refine() ensures both fields are still required on submission.
export const INDUCTION_DEFAULT_VALUES: InductionFormInput = {
  FullName: "",
  Phone: "",
  Email: "",
  Address: "",
  Photo: undefined,
  DriversLicense: undefined,
  AcceptAgreement: [],
  State: "",
  ContractorName: "",
  EdocketUsername: "",
  EdocketPassword: "",
};

// ─── FIELD PRIORITY ───────────────────────────────────────────────────────────
// Used by scroll-to-first-error logic to focus fields in the correct order.
// BotField not included — no honeypot in this authenticated form.

export const INDUCTION_FIELD_PRIORITY: Array<keyof InductionFormData> = [
  "FullName",
  "Phone",
  "Email",
  "Address",
  "Photo",
  "DriversLicense",
  "AcceptAgreement",
  "State",
  "ContractorName",
  "EdocketUsername",
  "EdocketPassword",
];
