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
import { EmailAttachment, PreparedEmail } from "../services/emailService";
import { generateExecutedAgreement } from "../services/pdfService";
import termsAgreementEmailTemplate from "../templates/termsAgreementEmailTemplate";
import { getCurrentDateTime } from "../utils/Helpers";
import type { FormConfig, FormData, ReadPdfFileFn } from "./formRegistry.types";

export const prepareTermsAgreementEmail = async (
  formData: FormData,
  readPdfFile: ReadPdfFileFn,
): Promise<PreparedEmail> => {
  const agreementCommencementDate = getCurrentDateTime();

  // generateExecutedAgreement accepts [key: string]: unknown — FormData is compatible
  const pdfBase64: string | null = await generateExecutedAgreement(formData);

  const attachments: EmailAttachment[] = [];

  if (pdfBase64) {
    const orgName = (
      typeof formData["Organisation Name"] === "string"
        ? formData["Organisation Name"]
        : "Unknown"
    )
      .replace(/[^a-z0-9]/gi, "_")
      .replace(/_+/g, "_")
      .substring(0, 30);

    const personName = (
      typeof formData["Full Name"] === "string"
        ? formData["Full Name"]
        : "Unknown"
    )
      .replace(/[^a-z0-9]/gi, "_")
      .replace(/_+/g, "_")
      .substring(0, 20);

    attachments.push({
      filename: `SecureCash T's & C's - ${orgName} - ${personName} - 2026.pdf`,
      type: "application/pdf",
      disposition: "attachment",
      content_id: "executed_agreement",
      content: pdfBase64,
    });
  } else {
    console.error("Failed to generate executed agreement PDF");
    // Fallback to static PDF if generation fails
    const staticPdfContent = readPdfFile("Terms & Conditions.pdf");
    if (staticPdfContent) {
      attachments.push({
        filename: "Terms & Conditions.pdf",
        type: "application/pdf",
        disposition: "attachment",
        content_id: "terms_conditions",
        content: staticPdfContent,
      });
    }
  }

  const htmlContent = termsAgreementEmailTemplate(
    formData,
    agreementCommencementDate,
  );
  const fullName =
    typeof formData["Full Name"] === "string" ? formData["Full Name"] : "";
  const orgNameDisplay =
    typeof formData["Organisation Name"] === "string"
      ? formData["Organisation Name"]
      : "";

  return {
    to: typeof formData.Email === "string" ? formData.Email : undefined,
    from: "SecureCash Sign Up <sign-up@securecash.com.au>",
    subject: `Terms & Conditions - ${fullName}, ${orgNameDisplay}`,
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
    attachments,
  };
};

export const termsConfig: FormConfig = {
  key: "terms",

  validation: {
    requiredFields: [
      "FullName",
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
