/**
 * quote.config.ts
 *
 * Registration config for the Quote Request form.
 * Multi-step conditional form (quote → banking/change based on Service selection).
 *
 * Progressive email logic:
 *   - Every step submission sends the admin request email
 *   - User confirmation email is held until the final step is reached
 *   - isProgressiveEmail flag (set by useProgressiveEmail) distinguishes
 *     intermediate from final submissions
 *
 * Banking/Change fields are optional at the schema level — required only when
 * the relevant service is selected. isQuoteFinalStep() determines whether
 * all selected service details have been collected.
 */

import {
  executeMultiEmailBatch,
  queueEmail,
  type EmailTaskRuntime,
} from "../services/emailQueue";
import {
  prepareQuoteAdminRequestEmail,
  prepareQuoteUserConfirmationEmail,
} from "../services/emailService";
import type { FormConfig, FormData, ReadPdfFileFn } from "./formRegistry.types";

// ─── Quote-specific helpers ───────────────────────────────────────────────────

/**
 * Determines whether all required service detail steps have been completed.
 * Banking requires Frequency + Amount. Change requires Frequency + NotesAmount.
 * If neither service is selected, the quote step itself is the final step.
 */
const isQuoteFinalStep = (data: FormData): boolean => {
  const services = (data.Service as string[]) ?? [];
  if (services.length === 0) return true;

  if (services.includes("Banking")) {
    if (!data.BankingFrequency || !data.BankingAmount) return false;
  }

  if (services.includes("Change")) {
    if (!data.ChangeFrequency || !data.ChangeNotesAmount) return false;
  }

  return true;
};

const buildQuoteTasks = (
  data: FormData,
  readPdfFile: ReadPdfFileFn,
  isProgressive: boolean,
  isFinalStep: boolean,
): EmailTaskRuntime[] => {
  const tasks: EmailTaskRuntime[] = [
    {
      id: "admin-request",
      type: "quote-admin",
      recipient: "admin",
      prepare: () => prepareQuoteAdminRequestEmail(data, readPdfFile),
    },
  ];

  if (!isProgressive && isFinalStep) {
    tasks.push({
      id: "user-confirmation",
      type: "quote-user",
      recipient: "customer",
      prepare: () => prepareQuoteUserConfirmationEmail(data, readPdfFile),
    });
  }

  return tasks;
};

// ─── Config ───────────────────────────────────────────────────────────────────

export const quoteConfig: FormConfig = {
  key: "quote",

  validation: {
    requiredFields: [
      "Name",
      "Email",
      "Organisation",
      "Phone",
      "Referrer",
      "Address",
      "Locations",
    ],
    arrayFields: ["Service"],
    emailFields: ["Email"],
  },

  queueEmails: (data, readPdfFile) => {
    const withDefaults: FormData = { ...data, FormID: data.FormID ?? "quote" };
    const isProgressive = data.isProgressiveEmail === true;
    const isFinalStep = isQuoteFinalStep(withDefaults);

    queueEmail({
      type: "quote",
      formType: "Quote",
      executeWithResilience: async () =>
        executeMultiEmailBatch(
          buildQuoteTasks(withDefaults, readPdfFile, isProgressive, isFinalStep),
          "Quote",
        ),
    });
  },

  executeEmailsSync: async (data, readPdfFile) => {
    const withDefaults: FormData = { ...data, FormID: data.FormID ?? "quote" };
    const isProgressive = data.isProgressiveEmail === true;
    const isFinalStep = isQuoteFinalStep(withDefaults);

    return executeMultiEmailBatch(
      buildQuoteTasks(withDefaults, readPdfFile, isProgressive, isFinalStep),
      "Quote",
    );
  },

  response: "Quote request submitted successfully!",

  logData: (data) => ({
    org: data.Organisation,
    name: data.Name,
  }),
};
