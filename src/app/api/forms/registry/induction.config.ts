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
import { EmailAttachment, PreparedEmail } from "../services/emailService";
import inductionEmailTemplate from "../templates/inductionEmailTemplate";
import { getMimeType } from "../utils/attachments";
import { getCurrentDateTime } from "../utils/Helpers";
import type { FormConfig, FormData, ReadPdfFileFn } from "./formRegistry.types";

export const prepareInductionEmail = (
  formData: FormData,
  readPdfFile: ReadPdfFileFn,
): PreparedEmail => {
  const currentDateTime = getCurrentDateTime();
  const htmlContent = inductionEmailTemplate(formData, currentDateTime);

  const attachments: EmailAttachment[] = [];

  if (formData.attachments && Array.isArray(formData.attachments)) {
    formData.attachments.forEach((attachment, index) => {
      try {
        if (attachment?.data && attachment?.filename) {
          // Strip data URI prefix if present
          let base64Data = attachment.data;
          if (base64Data.includes(",")) {
            base64Data = base64Data.split(",")[1];
          }

          const sizeBytes = Buffer.byteLength(base64Data, "base64");
          if (sizeBytes > 5 * 1024 * 1024) {
            console.warn(
              `Attachment ${attachment.filename} exceeds 5MB, skipping`,
            );
            return;
          }

          const detectedMimeType = getMimeType(attachment.filename);

          attachments.push({
            content: base64Data,
            filename: attachment.filename,
            type: detectedMimeType,
            disposition: "attachment",
          });
        }
      } catch (error) {
        console.error(`Error processing induction attachment ${index}:`, error);
      }
    });
  }

  const name = typeof formData.Name === "string" ? formData.Name : "";
  const state = typeof formData.State === "string" ? formData.State : "";

  return {
    to: "deepak@securecash.com.au",
    from: "SecureCash Operations <operations@securecash.com.au>",
    replyTo: typeof formData.Email === "string" ? formData.Email : undefined,
    subject: `Induction Complete - ${name}, ${state}`,
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
    attachments: attachments.length > 0 ? attachments : undefined,
  };
};

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
