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
import { AttachmentConfig, EmailAttachment, PreparedEmail, preparePdfAttachmentsWithCache, ProcessAttachmentsSequentiallyFn } from "../services/emailService";
import icaContractorWelcomeEmailTemplate from "../templates/icaContractorWelcomeEmailTemplate";
import icaEdocketsIntroductionEmailTemplate from "../templates/icaEdocketsIntroductionEmailTemplate";
import icaOperationsReviewEmailTemplate from "../templates/icaOperationsReviewEmailTemplate";
import { getMimeType, processAttachment, processAttachmentsSequentially } from "../utils/attachments";
import type { FormConfig, FormData, ReadPdfFileFn } from "./formRegistry.types";

export const prepareICAOperationsReviewEmail = (
  formData: FormData,
  readPdfFile: ReadPdfFileFn,
  processAttachmentsSequentiallyFn: ProcessAttachmentsSequentiallyFn,
): PreparedEmail => {
  const attachmentMappings = [
    { field: "GovernmentID", filename: "Guarantors Government ID" },
    { field: "WitnessID", filename: "Witness ID" },
    { field: "SecurityLicense", filename: "Security or Masters License" },
    { field: "CITInsurance", filename: "CIT Insurance" },
  ];

  // processAttachmentsSequentially expects Record<string, unknown> which is
  // compatible with FormData's index signature
  let attachments: EmailAttachment[] = processAttachmentsSequentiallyFn(
    attachmentMappings,
    formData as Record<string, unknown>,
  );

  // Additional user-uploaded attachments in the data/filename format
  if (formData.attachments && Array.isArray(formData.attachments)) {
    formData.attachments.forEach((attachment) => {
      if (attachment?.data && attachment?.filename) {
        const mimeType = getMimeType(attachment.filename);
        const processed = processAttachment(
          attachment.data,
          attachment.filename,
          mimeType,
        );
        if (processed) attachments.push(processed);
      }
    });
  }

  const attachmentConfigs: AttachmentConfig[] = [
    {
      filename: "Independant Contractors Agreement - Courier Lab.pdf",
      displayName: "Independant Contractors Agreement - Courier Lab.pdf",
    },
    {
      filename: "SecureCash Deed - Courier Lab.pdf",
      displayName: "SecureCash Deed - Courier Lab.pdf",
    },
  ];

  const pdfAttachments = preparePdfAttachmentsWithCache({
    attachments,
    attachmentConfigs,
    readPdfFile,
  });
  const htmlContent = icaOperationsReviewEmailTemplate(formData);
  const replyTo =
    typeof formData.Email === "string"
      ? formData.Email
      : "operations@securecash.com.au";

  return {
    to: "deepak@securecash.com.au",
    from: "operations@securecash.com.au",
    replyTo,
    subject: `Independent Contractor Agreement - ${typeof formData.Name === "string" ? formData.Name : ""}, ${typeof formData.BusinessName === "string" ? formData.BusinessName : ""}`,
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
    attachments: pdfAttachments,
  };
};

export const prepareICAContractorWelcomeEmail = (
  formData: FormData,
  readPdfFile: ReadPdfFileFn,
): PreparedEmail => {
  const attachments: EmailAttachment[] = [];
  const attachmentConfigs: AttachmentConfig[] = [
    {
      filename: "Independant Contractors Agreement - Courier Lab.pdf",
      displayName: "Independant Contractors Agreement - Courier Lab.pdf",
    },
    {
      filename: "SecureCash Deed - Courier Lab.pdf",
      displayName: "SecureCash Deed - Courier Lab.pdf",
    },
  ];

  const pdfAttachments = preparePdfAttachmentsWithCache({
    attachments,
    attachmentConfigs,
    readPdfFile,
  });
  const htmlContent = icaContractorWelcomeEmailTemplate(formData);

  const name =
    typeof formData.Name === "string"
      ? formData.Name
      : typeof formData.CompanyName === "string"
        ? formData.CompanyName
        : "Unknown";
  const business =
    typeof formData.BusinessName === "string"
      ? formData.BusinessName
      : typeof formData.CompanyName === "string"
        ? formData.CompanyName
        : "Unknown Business";

  return {
    to: typeof formData.Email === "string" ? formData.Email : undefined,
    from: "operations@securecash.com.au",
    subject: `Independent Contractor Agreement - ${name}, ${business}`,
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
    attachments: pdfAttachments,
  };
};

export const prepareICAEdocketsIntroductionEmail = (
  formData: FormData,
  readPdfFile?: ReadPdfFileFn,
): PreparedEmail => {
  const htmlContent = icaEdocketsIntroductionEmailTemplate();

  return {
    to: typeof formData.Email === "string" ? formData.Email : undefined,
    from: "info@edockets.app",
    subject: `eDocket App - ${typeof formData.Name === "string" ? formData.Name : "Name"}, ${typeof formData.BusinessName === "string" ? formData.BusinessName : "Business"}`,
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
  };
};

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
