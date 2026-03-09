/**
 * franchise.config.ts
 *
 * Registration config for the Franchise Enquiry form.
 * Sends two emails: admin inquiry + user welcome (with PDF attachments).
 *
 * ReferralSourceOther is conditionally required only when ReferralSource === "Other".
 * That conditional is enforced by Zod .refine() on the client — not repeated here.
 */

import {
  executeMultiEmailBatch,
  queueEmail,
  type EmailTaskRuntime,
} from "../services/emailQueue";
import { AttachmentConfig, EmailAttachment, PreparedEmail, preparePdfAttachmentsWithCache } from "../services/emailService";
import franchiseAdminInquiryEmailTemplate from "../templates/franchiseAdminInquiryEmailTemplate";
import franchiseUserWelcomeEmailTemplate from "../templates/franchiseUserWelcomeEmailTemplate";

import type { FormConfig, FormData, ReadPdfFileFn } from "./formRegistry.types";

export const prepareFranchiseAdminInquiryEmail = (
  formData: FormData,
  readPdfFile?: ReadPdfFileFn,
): PreparedEmail => {
  const htmlContent = franchiseAdminInquiryEmailTemplate(formData);

  return {
    to: "deepak@securecash.com.au",
    from: "SecureCash Franchise <franchise@securecash.com.au>",
    replyTo: typeof formData.Email === "string" ? formData.Email : undefined,
    subject: `SecureCash - Franchise Expression of Interest - ${typeof formData.FullName === "string" ? formData.FullName : "Unknown"}`,
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
  };
};

export const prepareFranchiseUserWelcomeEmail = (
  formData: FormData,
  readPdfFile: ReadPdfFileFn,
): PreparedEmail => {
  const attachments: EmailAttachment[] = [];
  const attachmentConfigs: AttachmentConfig[] = [
    {
      filename: "ACCC-Information-Statement.pdf",
      displayName:
        "ACCC - 2025 Information Statement for Prospective Franchisees.pdf",
    },
    {
      filename: "SecureCash-Franchise-Prospectus.pdf",
      displayName: "SecureCash Franchise Prospectus.pdf",
    },
    {
      filename: "SecureCash-DL-Flyer.pdf",
      displayName: "SecureCash Flyer.pdf",
    },
    { filename: "eDockets-DL-Flyer.pdf", displayName: "eDockets Flyer.pdf" },
  ];

  const pdfAttachments = preparePdfAttachmentsWithCache({
    attachments,
    attachmentConfigs,
    readPdfFile,
  });
  const htmlContent = franchiseUserWelcomeEmailTemplate();

  return {
    to: typeof formData.Email === "string" ? formData.Email : undefined,
    from: "SecureCash Franchise <franchise@securecash.com.au>",
    subject: "SecureCash Franchise Enquiry",
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
    attachments: pdfAttachments,
  };
};

const buildFranchiseTasks = (
  data: FormData,
  readPdfFile: ReadPdfFileFn,
): EmailTaskRuntime[] => [
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

export const franchiseConfig: FormConfig = {
  key: "franchise",

  validation: {
    requiredFields: [
      "FullName",
      "Email",
      "Phone",
      "Address",
      "InterestedArea",
      "ReasonForInterest",
      "ReferralSource",
    ],
    emailFields: ["Email"],
  },

  queueEmails: (data, readPdfFile) => {
    queueEmail({
      type: "franchise",
      formType: "Franchise",
      executeWithResilience: async () =>
        executeMultiEmailBatch(buildFranchiseTasks(data, readPdfFile), "Franchise"),
    });
  },

  executeEmailsSync: async (data, readPdfFile) =>
    executeMultiEmailBatch(buildFranchiseTasks(data, readPdfFile), "Franchise"),

  response: "Franchise enquiry submitted successfully!",

  logData: (data) => ({
    name: data.FullName,
    area: data.InterestedArea,
  }),
};
