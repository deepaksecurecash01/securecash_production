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
import {
  prepareFranchiseAdminInquiryEmail,
  prepareFranchiseUserWelcomeEmail,
} from "../services/emailService";
import type { FormConfig, FormData, ReadPdfFileFn } from "./formRegistry.types";

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
