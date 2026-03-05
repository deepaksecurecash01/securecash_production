/**
 * austrac.config.ts
 *
 * Registration config for the AUSTRAC Compliance form.
 * Sends one email to the organisation's email address.
 *
 * Website is optional — validated by Zod URL refine on the client.
 * Not listed in requiredFields.
 */

import {
  queueEmail,
  sendEmailWithRetry,
} from "../services/emailQueue";
import { prepareAustracSubmissionEmail } from "../services/emailService";
import type { FormConfig, FormData, ReadPdfFileFn } from "./formRegistry.types";

export const austracConfig: FormConfig = {
  key: "austrac",

  validation: {
    requiredFields: [
      "Organisation",
      "OrganisationEmail",
      "ABN",
      "OrganisationType",
      "Address",
      "State",
      "Personnel",
    ],
    emailFields: ["OrganisationEmail"],
  },

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
};
