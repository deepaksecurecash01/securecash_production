import {
  executeMultiEmailBatch,
  queueEmail,
  sendEmailWithRetry,
  EmailTaskRuntime,
  EmailResult,
} from "../services/emailQueue";
import {
  prepareAustracSubmissionEmail,
  prepareContactAdminNotificationEmail,
  prepareContactUserConfirmationEmail,
  prepareFranchiseAdminInquiryEmail,
  prepareFranchiseUserWelcomeEmail,
  prepareICAContractorWelcomeEmail,
  prepareICAEdocketsIntroductionEmail,
  prepareICAOperationsReviewEmail,
  prepareInductionEmail,
  prepareQuoteAdminRequestEmail,
  prepareQuoteUserConfirmationEmail,
  prepareSiteInfoAdminNotificationEmail,
  prepareSiteInfoUserConfirmationEmail,
  prepareTermsAgreementEmail,
} from "../services/emailService";
import { processAttachmentsSequentially } from "../utils/attachments";

// fastSanitize import removed — all string fields are sanitized once in route.ts
// via sanitizeFormData() before any handler is called. Re-sanitizing here was
// redundant and is now a compile error since fastSanitize no longer exists.

interface FormData {
  Service?: string[];
  BankingFrequency?: string;
  BankingAmount?: string;
  ChangeFrequency?: string;
  ChangeNotesAmount?: string;
  [key: string]: unknown;
}

type ReadPdfFileFn = (filename: string) => string | null;

interface HandlerResult {
  emailsSent: number;
  emailDetails: EmailResult[];
}

interface FormHandler {
  queueEmails: (data: FormData, readPdfFile: ReadPdfFileFn) => void;
  executeEmailsSync: (
    data: FormData,
    readPdfFile: ReadPdfFileFn,
  ) => Promise<HandlerResult>;
  response: string;
  logData: (data: FormData) => object;
}

/**
 * Determines whether a quote form submission is at the final step.
 * Progressive quote submissions only send the admin email — the user
 * confirmation is held until all required service details are collected.
 */
const isQuoteFinalStep = (formData: FormData): boolean => {
  const services = formData.Service ?? [];

  if (services.length === 0) return true;

  const hasBanking = services.includes("Banking");
  const hasChange = services.includes("Change");

  if (hasBanking) {
    const bankingComplete = !!(
      formData.BankingFrequency && formData.BankingAmount
    );
    if (!bankingComplete) return false;
  }

  if (hasChange) {
    const changeComplete = !!(
      formData.ChangeFrequency && formData.ChangeNotesAmount
    );
    if (!changeComplete) return false;
  }

  return true;
};

// ─── FORM HANDLERS ────────────────────────────────────────────────────────────

export const FORM_HANDLERS: Record<string, FormHandler> = {
  austrac: {
    queueEmails: (data, readPdfFile) => {
      queueEmail({
        type: "austrac",
        formType: "AUSTRAC",
        executeWithResilience: async () => {
          const emailData = prepareAustracSubmissionEmail(data, readPdfFile);
          const emailDetails = [await sendEmailWithRetry(emailData, "austrac")];
          return {
            emailsSent: emailDetails.filter((e) => e.success).length,
            emailDetails,
          };
        },
      });
    },
    executeEmailsSync: async (data, readPdfFile) => {
      const emailData = prepareAustracSubmissionEmail(data, readPdfFile);
      const emailDetails = [await sendEmailWithRetry(emailData, "austrac")];
      return {
        emailsSent: emailDetails.filter((e) => e.success).length,
        emailDetails,
      };
    },
    response: "AUSTRAC information submitted successfully!",
    logData: (data) => ({
      org: data.Organisation,
      email: data.OrganisationEmail,
    }),
  },

  terms: {
    queueEmails: (data, readPdfFile) => {
      queueEmail({
        type: "terms",
        formType: "Terms",
        executeWithResilience: async () => {
          const emailData = await prepareTermsAgreementEmail(data, readPdfFile);
          const emailDetails = [await sendEmailWithRetry(emailData, "terms")];
          return {
            emailsSent: emailDetails.filter((e) => e.success).length,
            emailDetails,
          };
        },
      });
    },
    executeEmailsSync: async (data, readPdfFile) => {
      const emailData = await prepareTermsAgreementEmail(data, readPdfFile);
      const emailDetails = [await sendEmailWithRetry(emailData, "terms")];
      return {
        emailsSent: emailDetails.filter((e) => e.success).length,
        emailDetails,
      };
    },
    response: "Terms & Conditions accepted successfully!",
    logData: (data) => ({
      org: data["Organisation Name"],
      name: data["Full Name"],
    }),
  },

  contact: {
    queueEmails: (data, readPdfFile) => {
      queueEmail({
        type: "contact",
        formType: "Contact",
        executeWithResilience: async () => {
          const tasks: EmailTaskRuntime[] = [
            {
              id: "admin-notification",
              type: "contact-admin",
              recipient: "admin",
              prepare: () =>
                prepareContactAdminNotificationEmail(data, readPdfFile),
            },
            {
              id: "user-confirmation",
              type: "contact-user",
              recipient: "customer",
              prepare: () =>
                prepareContactUserConfirmationEmail(data, readPdfFile),
            },
          ];
          return executeMultiEmailBatch(tasks, "Contact");
        },
      });
    },
    executeEmailsSync: async (data, readPdfFile) => {
      const tasks: EmailTaskRuntime[] = [
        {
          id: "admin-notification",
          type: "contact-admin",
          recipient: "admin",
          prepare: () =>
            prepareContactAdminNotificationEmail(data, readPdfFile),
        },
        {
          id: "user-confirmation",
          type: "contact-user",
          recipient: "customer",
          prepare: () => prepareContactUserConfirmationEmail(data, readPdfFile),
        },
      ];
      return executeMultiEmailBatch(tasks, "Contact");
    },
    response: "Contact request submitted successfully!",
    logData: (data) => ({ name: data.FullName, dept: data.Department }),
  },

  franchise: {
    queueEmails: (data, readPdfFile) => {
      queueEmail({
        type: "franchise",
        formType: "Franchise",
        executeWithResilience: async () => {
          const tasks: EmailTaskRuntime[] = [
            {
              id: "admin-inquiry",
              type: "franchise-admin",
              recipient: "admin",
              prepare: () =>
                prepareFranchiseAdminInquiryEmail(data, readPdfFile),
            },
            {
              id: "user-welcome",
              type: "franchise-user",
              recipient: "customer",
              prepare: () =>
                prepareFranchiseUserWelcomeEmail(data, readPdfFile),
            },
          ];
          return executeMultiEmailBatch(tasks, "Franchise");
        },
      });
    },
    executeEmailsSync: async (data, readPdfFile) => {
      const tasks: EmailTaskRuntime[] = [
        {
          id: "admin-inquiry",
          type: "franchise-admin",
          recipient: "admin",
          prepare: () => prepareFranchiseAdminInquiryEmail(data, readPdfFile),
        },
        {
          id: "user-welcome",
          type: "franchise-user",
          recipient: "customer",
          prepare: () => prepareFranchiseUserWelcomeEmail(data, readPdfFile),
        },
      ];
      return executeMultiEmailBatch(tasks, "Franchise");
    },
    response: "Franchise enquiry submitted successfully!",
    logData: (data) => ({ name: data.FullName, area: data.InterestedArea }),
  },

  ica: {
    queueEmails: (data, readPdfFile) => {
      queueEmail({
        type: "ica",
        formType: "ICA",
        executeWithResilience: async () => {
          const tasks: EmailTaskRuntime[] = [
            {
              id: "operations-review",
              type: "ica-operations",
              recipient: "admin",
              prepare: () =>
                prepareICAOperationsReviewEmail(
                  data,
                  readPdfFile,
                  processAttachmentsSequentially,
                ),
            },
            {
              id: "contractor-welcome",
              type: "ica-contractor",
              recipient: "customer",
              prepare: () =>
                prepareICAContractorWelcomeEmail(data, readPdfFile),
            },
            {
              id: "edockets-introduction",
              type: "ica-edockets",
              recipient: "customer",
              prepare: () =>
                prepareICAEdocketsIntroductionEmail(data, readPdfFile),
            },
          ];
          return executeMultiEmailBatch(tasks, "ICA");
        },
      });
    },
    executeEmailsSync: async (data, readPdfFile) => {
      const tasks: EmailTaskRuntime[] = [
        {
          id: "operations-review",
          type: "ica-operations",
          recipient: "admin",
          prepare: () =>
            prepareICAOperationsReviewEmail(
              data,
              readPdfFile,
              processAttachmentsSequentially,
            ),
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
      return executeMultiEmailBatch(tasks, "ICA");
    },
    response: "ICA form submitted successfully!",
    logData: (data) => ({ name: data.Name, business: data.BusinessName }),
  },

  quote: {
    queueEmails: (data, readPdfFile) => {
      // Data is already sanitized. Only inject the FormID default which is a
      // server-side computed value, not a user-supplied field.
      const withDefaults: FormData = {
        ...data,
        FormID: data.FormID ?? "quote",
      };

      const isProgressive = data.isProgressiveEmail === true;
      const isFinalStep = isQuoteFinalStep(withDefaults);

      queueEmail({
        type: "quote",
        formType: "Quote",
        executeWithResilience: async () => {
          const tasks: EmailTaskRuntime[] = [
            {
              id: "admin-request",
              type: "quote-admin",
              recipient: "admin",
              prepare: () =>
                prepareQuoteAdminRequestEmail(withDefaults, readPdfFile),
            },
          ];
          if (!isProgressive && isFinalStep) {
            tasks.push({
              id: "user-confirmation",
              type: "quote-user",
              recipient: "customer",
              prepare: () =>
                prepareQuoteUserConfirmationEmail(withDefaults, readPdfFile),
            });
          }
          return executeMultiEmailBatch(tasks, "Quote");
        },
      });
    },
    executeEmailsSync: async (data, readPdfFile) => {
      const withDefaults: FormData = {
        ...data,
        FormID: data.FormID ?? "quote",
      };

      const isProgressive = data.isProgressiveEmail === true;
      const isFinalStep = isQuoteFinalStep(withDefaults);

      const tasks: EmailTaskRuntime[] = [
        {
          id: "admin-request",
          type: "quote-admin",
          recipient: "admin",
          prepare: () =>
            prepareQuoteAdminRequestEmail(withDefaults, readPdfFile),
        },
      ];
      if (!isProgressive && isFinalStep) {
        tasks.push({
          id: "user-confirmation",
          type: "quote-user",
          recipient: "customer",
          prepare: () =>
            prepareQuoteUserConfirmationEmail(withDefaults, readPdfFile),
        });
      }
      return executeMultiEmailBatch(tasks, "Quote");
    },
    response: "Quote request submitted successfully!",
    logData: (data) => ({ org: data.Organisation, name: data.Name }),
  },

  siteinfo: {
    queueEmails: (data, readPdfFile) => {
      // Data is already sanitized. Only inject server-side computed defaults.
      const withDefaults: FormData = {
        ...data,
        Type: data.Type ?? "Regular Service",
        Services: Array.isArray(data.Services)
          ? data.Services
          : [data.Services].filter(Boolean),
      };

      queueEmail({
        type: "siteinfo",
        formType: "Site Info",
        executeWithResilience: async () => {
          const tasks: EmailTaskRuntime[] = [
            {
              id: "admin-notification",
              type: "siteinfo-admin",
              recipient: "admin",
              prepare: () =>
                prepareSiteInfoAdminNotificationEmail(
                  withDefaults,
                  readPdfFile,
                ),
            },
            {
              id: "user-confirmation",
              type: "siteinfo-user",
              recipient: "customer",
              prepare: () =>
                prepareSiteInfoUserConfirmationEmail(withDefaults, readPdfFile),
            },
          ];
          return executeMultiEmailBatch(tasks, "Site Info");
        },
      });
    },
    executeEmailsSync: async (data, readPdfFile) => {
      const withDefaults: FormData = {
        ...data,
        Type: data.Type ?? "Regular Service",
        Services: Array.isArray(data.Services)
          ? data.Services
          : [data.Services].filter(Boolean),
      };

      const tasks: EmailTaskRuntime[] = [
        {
          id: "admin-notification",
          type: "siteinfo-admin",
          recipient: "admin",
          prepare: () =>
            prepareSiteInfoAdminNotificationEmail(withDefaults, readPdfFile),
        },
        {
          id: "user-confirmation",
          type: "siteinfo-user",
          recipient: "customer",
          prepare: () =>
            prepareSiteInfoUserConfirmationEmail(withDefaults, readPdfFile),
        },
      ];
      return executeMultiEmailBatch(tasks, "Site Info");
    },
    response: "Site info submitted successfully!",
    logData: (data) => ({ business: data.BusinessName, contact: data.Contact }),
  },

  specialevent: {
    queueEmails: (data, readPdfFile) => {
      // Data is already sanitized. Only inject server-side computed defaults.
      const withDefaults: FormData = {
        ...data,
        Type: data.Type ?? "Special Event",
      };

      queueEmail({
        type: "specialevent",
        formType: "Special Event",
        executeWithResilience: async () => {
          const tasks: EmailTaskRuntime[] = [
            {
              id: "admin-notification",
              type: "specialevent-admin",
              recipient: "admin",
              prepare: () =>
                prepareSiteInfoAdminNotificationEmail(
                  withDefaults,
                  readPdfFile,
                ),
            },
            {
              id: "user-confirmation",
              type: "specialevent-user",
              recipient: "customer",
              prepare: () =>
                prepareSiteInfoUserConfirmationEmail(withDefaults, readPdfFile),
            },
          ];
          return executeMultiEmailBatch(tasks, "Special Event");
        },
      });
    },
    executeEmailsSync: async (data, readPdfFile) => {
      const withDefaults: FormData = {
        ...data,
        Type: data.Type ?? "Special Event",
      };

      const tasks: EmailTaskRuntime[] = [
        {
          id: "admin-notification",
          type: "specialevent-admin",
          recipient: "admin",
          prepare: () =>
            prepareSiteInfoAdminNotificationEmail(withDefaults, readPdfFile),
        },
        {
          id: "user-confirmation",
          type: "specialevent-user",
          recipient: "customer",
          prepare: () =>
            prepareSiteInfoUserConfirmationEmail(withDefaults, readPdfFile),
        },
      ];
      return executeMultiEmailBatch(tasks, "Special Event");
    },
    response: "Special event info submitted successfully!",
    logData: (data) => ({ business: data.BusinessName, type: "special" }),
  },

  induction: {
    queueEmails: (data, readPdfFile) => {
      queueEmail({
        type: "induction",
        formType: "Induction",
        executeWithResilience: async () => {
          const emailData = prepareInductionEmail(data, readPdfFile);
          const emailDetails = [
            await sendEmailWithRetry(emailData, "induction"),
          ];
          return {
            emailsSent: emailDetails.filter((e) => e.success).length,
            emailDetails,
          };
        },
      });
    },
    executeEmailsSync: async (data, readPdfFile) => {
      const emailData = prepareInductionEmail(data, readPdfFile);
      const emailDetails = [await sendEmailWithRetry(emailData, "induction")];
      return {
        emailsSent: emailDetails.filter((e) => e.success).length,
        emailDetails,
      };
    },
    response: "Induction form submitted successfully!",
    logData: (data) => ({
      name: data.Name,
      state: data.State,
      contractor: data.ContractorName,
    }),
  },
};
