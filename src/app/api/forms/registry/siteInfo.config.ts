/**
 * siteInfo.config.ts
 *
 * Registration config for the Site Information form.
 * Multi-step hybrid form (business → contact → service → review → risk/submit).
 *
 * Sends two emails: admin notification + user confirmation (with PDF attachments).
 *
 * Services is an array field — must have at least one entry.
 * Schedule is an array field — must have at least one entry.
 * Dates is a date field — presence check only, future-date validation is Zod's job.
 *
 * Type defaults to "Regular Service" server-side if not present.
 * Services is normalised to an array in case a single string value arrives.
 */

import {
  executeMultiEmailBatch,
  queueEmail,
  type EmailTaskRuntime,
} from "../services/emailQueue";
import { AttachmentConfig, EmailAttachment, PreparedEmail, preparePdfAttachmentsWithCache } from "../services/emailService";
import siteInfoAdminNotificationEmailTemplate from "../templates/siteInfoAdminNotificationEmailTemplate";
import siteInfoUserConfirmationEmailTemplate from "../templates/siteInfoUserConfirmationEmailTemplate";
import { formatArrayField, getCurrentDateTime } from "../utils/Helpers";
import type { FormConfig, FormData, ReadPdfFileFn } from "./formRegistry.types";

export const prepareSiteInfoAdminNotificationEmail = (
  formData: FormData,
  readPdfFile?: ReadPdfFileFn,
): PreparedEmail => {
  const currentDateTime = getCurrentDateTime();
  const htmlContent = siteInfoAdminNotificationEmailTemplate(
    formData,
    currentDateTime,
    formatArrayField,
  );

  const businessName =
    typeof formData.BusinessName === "string" ? formData.BusinessName : "";
  const postcode =
    typeof formData.Postcode === "string" ? formData.Postcode : "";
  const type =
    typeof formData.Type === "string" ? formData.Type : "Regular Service";

  return {
    to: "deepak@securecash.com.au",
    from: "SecureCash Sign Up <sign-up@securecash.com.au>",
    subject: `Site Info - ${businessName} (${postcode}), ${type}`,
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
  };
};

export const prepareSiteInfoUserConfirmationEmail = (
  formData: FormData,
  readPdfFile: ReadPdfFileFn,
): PreparedEmail => {
  const attachments: EmailAttachment[] = [];
  const attachmentConfigs: AttachmentConfig[] = [
    {
      filename: "SecureCash-Online-Services-Flyer.pdf",
      displayName: "SecureCash Online Services Flyer.pdf",
    },
    {
      filename: "How-to-Prepare-Your-Banking.pdf",
      displayName: "How to Prepare Your Banking.pdf",
    },
  ];

  const pdfAttachments = preparePdfAttachmentsWithCache({
    attachments,
    attachmentConfigs,
    readPdfFile,
  });
  const htmlContent = siteInfoUserConfirmationEmailTemplate(formData);

  const businessName =
    typeof formData.BusinessName === "string" ? formData.BusinessName : "";
  const type =
    typeof formData.Type === "string" ? formData.Type : "Regular Service";

  return {
    to: typeof formData.Email === "string" ? formData.Email : undefined,
    from: "SecureCash Sign Up <sign-up@securecash.com.au>",
    subject: `SecureCash Business Enrolment - ${businessName} (${type})`,
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
    attachments: pdfAttachments,
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const withSiteInfoDefaults = (data: FormData): FormData => ({
  ...data,
  Type: data.Type ?? "Regular Service",
  Services: Array.isArray(data.Services)
    ? data.Services
    : [data.Services].filter(Boolean),
});

const buildSiteInfoTasks = (
  data: FormData,
  readPdfFile: ReadPdfFileFn,
): EmailTaskRuntime[] => [
  {
    id: "admin-notification",
    type: "siteinfo-admin",
    recipient: "admin",
    prepare: () => prepareSiteInfoAdminNotificationEmail(data, readPdfFile),
  },
  {
    id: "user-confirmation",
    type: "siteinfo-user",
    recipient: "customer",
    prepare: () => prepareSiteInfoUserConfirmationEmail(data, readPdfFile),
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

export const siteInfoConfig: FormConfig = {
  key: "siteinfo",

  validation: {
    requiredFields: [
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
    arrayFields: ["Services", "Schedule"],
    dateFields: ["Dates"],
    emailFields: ["Email", "Accounts"],
  },

  queueEmails: (data, readPdfFile) => {
    const enriched = withSiteInfoDefaults(data);
    queueEmail({
      type: "siteinfo",
      formType: "Site Info",
      executeWithResilience: async () =>
        executeMultiEmailBatch(buildSiteInfoTasks(enriched, readPdfFile), "Site Info"),
    });
  },

  executeEmailsSync: async (data, readPdfFile) => {
    const enriched = withSiteInfoDefaults(data);
    return executeMultiEmailBatch(buildSiteInfoTasks(enriched, readPdfFile), "Site Info");
  },

  response: "Site info submitted successfully!",

  logData: (data) => ({
    business: data.BusinessName,
    contact: data.Contact,
  }),
};
