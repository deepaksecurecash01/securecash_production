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

/**
 * Required string/primitive fields for each form type.
 *
 * Rules for what belongs here:
 *   - Every non-optional Zod string/primitive field that is NOT a file upload,
 *     NOT a honeypot (BotField), and NOT an array must be listed.
 *   - Array fields (min-length checks) belong in FORM_ARRAY_RULES below.
 *   - Date fields (presence checks) belong in FORM_DATE_RULES below.
 *   - File fields (GovernmentID, Photo, etc.) are validated by attachment
 *     size/type checks in validation.ts — do not list them here.
 *   - Conditional fields (e.g. CallbackDate only when ChkCallBack is set)
 *     are enforced by Zod superRefine on the client — omit from backend rules.
 *
 * Keep this in sync with the corresponding Zod schema whenever fields change.
 */
export const FORM_VALIDATION_RULES: Record<string, string[]> = {
  contact: [
    "FullName",
    "Email",
    "Department",
    "Organisation",
    "Phone",
    "Message",
  ],
  franchise: [
    "FullName",
    "Email",
    "Phone",
    "Address",
    "InterestedArea",
    "ReasonForInterest",
    "ReferralSource",
  ],
  ica: [
    "Name",
    "Email",
    "BusinessName",
    "OrganisationType",
    "ABN",
    "Phone",
    "Address",
    "AddressPostal",
    "NameConfirm",
    "AddressResidential",
    "WitnessName",
    "WitnessAddress",
    "eDocketsContractorCode",
  ],
  quote: [
    "Name",
    "Email",
    "Organisation",
    "Phone",
    "Referrer",
    "Address",
    "Locations",
  ],
  siteinfo: [
    "BusinessName",
    "Email",
    "Contact",
    "Address",
    "Suburb",
    "State",
    "Postcode",
    "Position",
    "Phone",
    "Accounts",
    "Bank",
    "Amount",
  ],
  specialevent: [
    "BusinessName",
    "Email",
    "Contact",
    "Address",
    "Suburb",
    "State",
    "Postcode",
    "Position",
    "Phone",
    "Accounts",
    "Dates",
    "Bank",
    "Amount",
  ],
  terms: ["Name", "Position", "Email", "Organisation", "ABN", "Signature"],
  austrac: [
    "Organisation",
    "OrganisationEmail",
    "ABN",
    "OrganisationType",
    "Address",
    "State",
    "Personnel",
  ],
  induction: [
    "Name",
    "Email",
    "Phone",
    "Address",
    "State",
    "ContractorName",
    "EdocketUsername",
    "EdocketPassword",
  ],
};

/**
 * Array fields that must have at least one selected value.
 * Validated separately in validation.ts using Array.isArray + length check.
 * Mirrors every z.array(...).min(1, ...) in the corresponding Zod schema.
 */
export const FORM_ARRAY_RULES: Record<string, string[]> = {
  ica: ["AcceptAgreement"],
  quote: ["Service"],
  siteinfo: ["Services", "Schedule"],
  specialevent: ["Services"],
  induction: ["AcceptAgreement"],
};

/**
 * Date fields that must be present (non-null, non-undefined).
 * Validated separately in validation.ts — presence only, not range.
 * Range/past-date logic is enforced by Zod on the client.
 */
export const FORM_DATE_RULES: Record<string, string[]> = {
  ica: ["DateCommencement", "DateDeed"],
  siteinfo: ["Dates"],
  terms: ["Birthdate"],
};

export const EMAIL_FIELDS: string[] = ["Email", "OrganisationEmail"];

export const MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
