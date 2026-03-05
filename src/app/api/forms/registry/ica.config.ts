/**
 * ica.config.ts
 *
 * Registration config for the Independent Contractors Agreement form.
 * Sends three emails in a single batch:
 *   1. Operations review (admin) — includes processAttachmentsSequentially
 *      for GovernmentID, WitnessID, SecurityLicense, CITInsurance uploads
 *   2. Contractor welcome (contractor) — ICA summary + deed + operational rules
 *   3. eDockets introduction (contractor) — eDocket system onboarding email
 *
 * File fields (GovernmentID, WitnessID, SecurityLicense, CITInsurance) are
 * excluded from requiredFields — they are handled by the file upload pipeline
 * in useFormManager and processed by processAttachmentsSequentially in
 * prepareICAOperationsReviewEmail. The backend receives them as attachments,
 * not raw field values.
 *
 * AcceptAgreement is an array field — must have at least one entry.
 * DateCommencement and DateDeed are date fields — presence checks only.
 * Past-date validation is enforced by Zod on the client.
 *
 * BotField is intentionally excluded — ICA is an authenticated contractor
 * onboarding form. No honeypot needed for authenticated flows.
 */

import {
  executeMultiEmailBatch,
  queueEmail,
  type EmailTaskRuntime,
} from "../services/emailQueue";
import {
  prepareICAOperationsReviewEmail,
  prepareICAContractorWelcomeEmail,
  prepareICAEdocketsIntroductionEmail,
} from "../services/emailService";
import { processAttachmentsSequentially } from "../utils/attachments";
import type { FormConfig, FormData, ReadPdfFileFn } from "./formRegistry.types";

// ─── Task builder ─────────────────────────────────────────────────────────────

const buildIcaTasks = (
  data: FormData,
  readPdfFile: ReadPdfFileFn,
): EmailTaskRuntime[] => [
  {
    id: "operations-review",
    type: "ica-operations",
    recipient: "admin",
    prepare: () =>
      prepareICAOperationsReviewEmail(data, readPdfFile, processAttachmentsSequentially),
  },
  {
    id: "contractor-welcome",
    type: "ica-contractor",
    recipient: "customer",
    prepare: () => prepareICAContractorWelcomeEmail(data, readPdfFile),
  },
  {
    id: "edockets-introduction",
    type: "ica-edockets",
    recipient: "customer",
    prepare: () => prepareICAEdocketsIntroductionEmail(data, readPdfFile),
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

export const icaConfig: FormConfig = {
  key: "ica",

  validation: {
    requiredFields: [
      "Name",
      "OrganisationType",
      "ABN",
      "Phone",
      "Email",
      "Address",
      "AddressPostal",
      "NameConfirm",
      "AddressResidential",
      "BusinessName",
      "WitnessName",
      "WitnessAddress",
      "eDocketsContractorCode",
    ],
    arrayFields: ["AcceptAgreement"],
    dateFields: ["DateCommencement", "DateDeed"],
    emailFields: ["Email"],
  },

  queueEmails: (data, readPdfFile) => {
    queueEmail({
      type: "ica",
      formType: "ICA",
      executeWithResilience: async () =>
        executeMultiEmailBatch(buildIcaTasks(data, readPdfFile), "ICA"),
    });
  },

  executeEmailsSync: async (data, readPdfFile) =>
    executeMultiEmailBatch(buildIcaTasks(data, readPdfFile), "ICA"),

  response: "ICA form submitted successfully!",

  logData: (data) => ({
    name: data.Name,
    business: data.BusinessName,
  }),
};
