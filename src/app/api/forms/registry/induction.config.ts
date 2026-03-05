/**
 * induction.config.ts
 *
 * Registration config for the Induction form.
 * Authenticated onboarding form — sends one admin email to operations
 * with Photo and DriversLicense file attachments.
 *
 * File fields (Photo, DriversLicense) are excluded from requiredFields.
 * They are processed by the file upload pipeline in useFormManager and
 * arrive as attachments in the payload — prepareInductionEmail handles
 * them via the induction-specific attachment path (uses .data not .content).
 *
 * AcceptAgreement is an array field — must include "accepted".
 * Value-level refine ("accepted" string) is enforced by Zod on the client.
 *
 * BotField intentionally excluded — authenticated flow, no honeypot needed.
 * No emailFields — no outbound email to the inductee, admin-only notification.
 */

import {
  queueEmail,
  sendEmailWithRetry,
} from "../services/emailQueue";
import { prepareInductionEmail } from "../services/emailService";
import type { FormConfig, FormData, ReadPdfFileFn } from "./formRegistry.types";

export const inductionConfig: FormConfig = {
  key: "induction",

  validation: {
    requiredFields: [
      "Name",
      "Phone",
      "Email",
      "Address",
      "State",
      "ContractorName",
      "EdocketUsername",
      "EdocketPassword",
    ],
    arrayFields: ["AcceptAgreement"],
    // No emailFields — email is used in the form but no outbound
    // confirmation email is sent to the inductee. Admin only.
  },

  queueEmails: (data, readPdfFile) => {
    queueEmail({
      type: "induction",
      formType: "Induction",
      executeWithResilience: async () => {
        const emailData = prepareInductionEmail(data, readPdfFile);
        const emailDetails = [await sendEmailWithRetry(emailData, "induction")];
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
};
