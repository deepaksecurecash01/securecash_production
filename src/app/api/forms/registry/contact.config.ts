/**
 * contact.config.ts
 *
 * Complete registration config for the Contact form.
 *
 * This file is the single place that defines everything the backend needs
 * to know about the Contact form:
 *   - Which fields are required (validation)
 *   - Which fields are arrays / dates / emails
 *   - How to send its emails (sync and async)
 *   - What success message to return
 *   - What to log
 *
 * The frontend (ContactForm.tsx, ContactFormSchema.ts, useFormManager) is
 * completely unaffected by this file.
 *
 * ─── Conditional fields note ──────────────────────────────────────────────────
 * CallbackDate, CallbackTime, CallbackState are NOT listed in requiredFields.
 * They are conditionally required only when ChkCallBack is checked. That
 * conditional logic is enforced by Zod superRefine on the client. The backend
 * receives the already-validated payload — no need to re-check conditionals here.
 */

import {
  executeMultiEmailBatch,
  queueEmail,
  type EmailTaskRuntime,
} from "../services/emailQueue";
import { formatCallbackDate, getCurrentDateTime } from "../utils/Helpers";
import { PreparedEmail } from "../services/emailService";
import type { FormConfig, FormData, ReadPdfFileFn } from "./formRegistry.types";
import contactAdminNotificationEmailTemplate from "../templates/contactAdminNotificationEmailTemplate";
import contactUserConfirmationEmailTemplate from "../templates/contactUserConfirmationEmailTemplate";


export const prepareContactAdminNotificationEmail = (
  formData: FormData,
  readPdfFile?: ReadPdfFileFn,
): PreparedEmail => {
  const currentDateTime = getCurrentDateTime();
  const callbackDate =
    typeof formData.CallbackDate === "string" ||
    formData.CallbackDate instanceof Date ||
    formData.CallbackDate === null ||
    formData.CallbackDate === undefined
      ? formData.CallbackDate
      : undefined;
  const formattedCallbackDate = formatCallbackDate(callbackDate);
  const htmlContent = contactAdminNotificationEmailTemplate(
    formData,
    currentDateTime,
    formattedCallbackDate,
  );

  return {
    to: typeof formData.Email === "string" ? formData.Email : undefined,
    from: "SecureCash Customer Service <customers@securecash.com.au>",
    replyTo: typeof formData.Email === "string" ? formData.Email : undefined,
    subject: "SecureCash - Contact Request",
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
  };
};

export const prepareContactUserConfirmationEmail = (
  formData: FormData,
  readPdfFile?: ReadPdfFileFn,
): PreparedEmail => {
  const htmlContent = contactUserConfirmationEmailTemplate();

  return {
    to: typeof formData.Email === "string" ? formData.Email : undefined,
    from: "SecureCash Customer Service <customers@securecash.com.au>",
    subject: "SecureCash - Contact Request",
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
  };
};

// ─── Email task builder ───────────────────────────────────────────────────────
// Extracted so queueEmails and executeEmailsSync don't duplicate task definitions.

const buildContactTasks = (
  data: FormData,
  readPdfFile: ReadPdfFileFn,
): EmailTaskRuntime[] => [
  {
    id: "admin-notification",
    type: "contact-admin",
    recipient: "admin",
    prepare: () => prepareContactAdminNotificationEmail(data, readPdfFile),
  },
  {
    id: "user-confirmation",
    type: "contact-user",
    recipient: "customer",
    prepare: () => prepareContactUserConfirmationEmail(data, readPdfFile),
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

export const contactConfig: FormConfig = {
  key: "contact",

  validation: {
    requiredFields: [
      "FullName",
      "Email",
      "Department",
      "Organisation",
      "Phone",
      "Message",
    ],
    // No arrayFields — ChkCallBack is optional (unchecked = no callback wanted)
    // No dateFields — CallbackDate is conditional, enforced by Zod superRefine
    emailFields: ["Email"],
  },

  queueEmails: (data, readPdfFile) => {
    queueEmail({
      type: "contact",
      formType: "Contact",
      executeWithResilience: async () =>
        executeMultiEmailBatch(buildContactTasks(data, readPdfFile), "Contact"),
    });
  },

  executeEmailsSync: async (data, readPdfFile) =>
    executeMultiEmailBatch(buildContactTasks(data, readPdfFile), "Contact"),

  response: "Contact request submitted successfully!",

  logData: (data) => ({
    name: data.FullName,
    dept: data.Department,
  }),
};
