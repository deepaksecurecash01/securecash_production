/**
 * specialEvent.config.ts
 *
 * Registration config for the Special Event form.
 * Identical structure to siteInfo — same two email preparers, same field set.
 * The only difference is Type defaults to "Special Event" instead of
 * "Regular Service", which flows through to the admin email subject line.
 *
 * Shares prepareSiteInfoAdminNotificationEmail and
 * prepareSiteInfoUserConfirmationEmail intentionally — the email content
 * is template-driven and the Type field distinguishes the two in the subject.
 */

import {
  executeMultiEmailBatch,
  queueEmail,
  type EmailTaskRuntime,
} from "../services/emailQueue";
import {
  prepareSiteInfoAdminNotificationEmail,
  prepareSiteInfoUserConfirmationEmail,
} from "./siteInfo.config";
import type { FormConfig, FormData, ReadPdfFileFn } from "./formRegistry.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const withSpecialEventDefaults = (data: FormData): FormData => ({
  ...data,
  Type: data.Type ?? "Special Event",
  Services: Array.isArray(data.Services)
    ? data.Services
    : [data.Services].filter(Boolean),
});

const buildSpecialEventTasks = (
  data: FormData,
  readPdfFile: ReadPdfFileFn,
): EmailTaskRuntime[] => [
  {
    id: "admin-notification",
    type: "specialevent-admin",
    recipient: "admin",
    prepare: () => prepareSiteInfoAdminNotificationEmail(data, readPdfFile),
  },
  {
    id: "user-confirmation",
    type: "specialevent-user",
    recipient: "customer",
    prepare: () => prepareSiteInfoUserConfirmationEmail(data, readPdfFile),
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

export const specialEventConfig: FormConfig = {
  key: "specialevent",

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
    const enriched = withSpecialEventDefaults(data);
    queueEmail({
      type: "specialevent",
      formType: "Special Event",
      executeWithResilience: async () =>
        executeMultiEmailBatch(
          buildSpecialEventTasks(enriched, readPdfFile),
          "Special Event",
        ),
    });
  },

  executeEmailsSync: async (data, readPdfFile) => {
    const enriched = withSpecialEventDefaults(data);
    return executeMultiEmailBatch(
      buildSpecialEventTasks(enriched, readPdfFile),
      "Special Event",
    );
  },

  response: "Special event info submitted successfully!",

  logData: (data) => ({
    business: data.BusinessName,
    type: "special",
  }),
};
