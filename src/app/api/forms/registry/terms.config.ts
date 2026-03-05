/**
 * terms.config.ts
 *
 * Registration config for the Terms & Conditions / Service Agreement form.
 * Sends one email with a dynamically generated PDF of the executed agreement.
 *
 * prepareTermsAgreementEmail is async (generates the PDF) — executeEmailsSync
 * awaits it correctly. queueEmails wraps it in executeWithResilience as normal.
 *
 * Birthdate is listed in dateFields — presence check only.
 * Age validation (min 13) is enforced by Zod on the client.
 */

import {
  queueEmail,
  sendEmailWithRetry,
} from "../services/emailQueue";
import { prepareTermsAgreementEmail } from "../services/emailService";
import type { FormConfig, FormData, ReadPdfFileFn } from "./formRegistry.types";

export const termsConfig: FormConfig = {
  key: "terms",

  validation: {
    requiredFields: [
      "Name",
      "Position",
      "Email",
      "Organisation",
      "ABN",
      "Signature",
    ],
    dateFields: ["Birthdate"],
    emailFields: ["Email"],
  },

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
};
