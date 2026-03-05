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
import {
  prepareSiteInfoAdminNotificationEmail,
  prepareSiteInfoUserConfirmationEmail,
} from "../services/emailService";
import type { FormConfig, FormData, ReadPdfFileFn } from "./formRegistry.types";

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
