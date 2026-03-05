import austracSubmissionEmailTemplate from "../templates/austracSubmissionEmailTemplate";
import contactAdminNotificationEmailTemplate from "../templates/contactAdminNotificationEmailTemplate";
import contactUserConfirmationEmailTemplate from "../templates/contactUserConfirmationEmailTemplate";
import franchiseAdminInquiryEmailTemplate from "../templates/franchiseAdminInquiryEmailTemplate";
import franchiseUserWelcomeEmailTemplate from "../templates/franchiseUserWelcomeEmailTemplate";
import icaContractorWelcomeEmailTemplate from "../templates/icaContractorWelcomeEmailTemplate";
import icaEdocketsIntroductionEmailTemplate from "../templates/icaEdocketsIntroductionEmailTemplate";
import icaOperationsReviewEmailTemplate from "../templates/icaOperationsReviewEmailTemplate";
import inductionEmailTemplate from "../templates/inductionEmailTemplate";
import quoteAdminRequestEmailTemplate from "../templates/quoteAdminRequestEmailTemplate";
import quoteUserConfirmationEmailTemplate from "../templates/quoteUserConfirmationEmailTemplate";
import siteInfoAdminNotificationEmailTemplate from "../templates/siteInfoAdminNotificationEmailTemplate";
import siteInfoUserConfirmationEmailTemplate from "../templates/siteInfoUserConfirmationEmailTemplate";
import termsAgreementEmailTemplate from "../templates/termsAgreementEmailTemplate";
import {
  formatArrayField,
  formatCallbackDate,
  getCurrentDateTime,
} from "../utils/Helpers";
import {
  getMimeType,
  processAttachment,
  ProcessedAttachment,
} from "../utils/attachments";
import { generateExecutedAgreement } from "./pdfService";

// FormData uses unknown (not any) for the index signature.
// Every prepare* function narrows the fields it needs before use.
export interface FormData {
  attachments?: Array<{
    data?: string; // base64 — used by induction / ICA attachment format
    content?: string; // base64 — used by quote / siteinfo attachment format
    filename: string;
    type: string;
  }>;
  Email?: string;
  Name?: string;
  State?: string;
  [key: string]: unknown;
}

interface EmailAttachment {
  content: string;
  filename: string;
  type: string;
  disposition: string;
  content_id?: string;
}

interface PreparedEmail {
  to: string | undefined;
  from: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  attachments?: EmailAttachment[];
}

export type ReadPdfFileFn = (filename: string) => string | null;

// Typed signature for processAttachmentsSequentially — avoids any at the call site
type ProcessAttachmentsSequentiallyFn = (
  mappings: { field: string; filename: string }[],
  formData: Record<string, unknown>,
) => ProcessedAttachment[];

// ─── INTERNAL HELPERS ─────────────────────────────────────────────────────────

interface AttachmentConfig {
  filename: string;
  displayName: string;
}

/**
 * Reads PDFs from the cache via readPdfFile and appends them to the
 * attachments array in-place, returning the same array.
 */
const preparePdfAttachmentsWithCache = ({
  attachments,
  attachmentConfigs,
  readPdfFile,
}: {
  attachments: EmailAttachment[];
  attachmentConfigs: AttachmentConfig[];
  readPdfFile: ReadPdfFileFn;
}): EmailAttachment[] => {
  for (const config of attachmentConfigs) {
    const pdfContent = readPdfFile(config.filename);
    if (pdfContent) {
      attachments.push({
        content: pdfContent,
        filename: config.displayName,
        type: "application/pdf",
        disposition: "attachment",
      });
    }
  }
  return attachments;
};

/**
 * Converts user-uploaded attachments from the FormData shape into the
 * EmailAttachment shape expected by SendGrid. Skips attachments over 5 MB.
 */
const prepareAttachments = (formData: FormData): EmailAttachment[] => {
  const attachments: EmailAttachment[] = [];

  if (!formData.attachments || !Array.isArray(formData.attachments)) {
    return attachments;
  }

  formData.attachments.forEach((attachment, index) => {
    try {
      if (attachment?.filename && attachment?.content) {
        const sizeBytes = Buffer.byteLength(attachment.content, "base64");
        if (sizeBytes > 5 * 1024 * 1024) return;

        const detectedMimeType = getMimeType(attachment.filename);
        const finalMimeType = attachment.type || detectedMimeType;

        attachments.push({
          content: attachment.content,
          filename: attachment.filename,
          type: finalMimeType,
          disposition: "attachment",
        });
      }
    } catch (error) {
      console.error(`Error processing attachment ${index}:`, error);
    }
  });

  return attachments;
};

// ─── EMAIL PREPARERS ──────────────────────────────────────────────────────────

export const prepareAustracSubmissionEmail = (
  formData: FormData,
  readPdfFile?: ReadPdfFileFn,
): PreparedEmail => {
  const currentDateTime = getCurrentDateTime();
  const htmlContent = austracSubmissionEmailTemplate(formData, currentDateTime);

  return {
    to:
      typeof formData.OrganisationEmail === "string"
        ? formData.OrganisationEmail
        : undefined,
    from: "SecureCash Sign Up <sign-up@securecash.com.au>",
    subject: `AUSTRAC - ${typeof formData.Organisation === "string" ? formData.Organisation : "Unknown Organisation"}`,
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
  };
};

export const prepareContactAdminNotificationEmail = (
  formData: FormData,
  readPdfFile?: ReadPdfFileFn,
): PreparedEmail => {
  const currentDateTime = getCurrentDateTime();
  // formatCallbackDate accepts string | Date | null | undefined — unknown must be narrowed first
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

export const prepareICAOperationsReviewEmail = (
  formData: FormData,
  readPdfFile: ReadPdfFileFn,
  processAttachmentsSequentiallyFn: ProcessAttachmentsSequentiallyFn,
): PreparedEmail => {
  const attachmentMappings = [
    { field: "GovernmentID", filename: "Guarantors Government ID" },
    { field: "WitnessID", filename: "Witness ID" },
    { field: "SecurityLicense", filename: "Security or Masters License" },
    { field: "CITInsurance", filename: "CIT Insurance" },
  ];

  // processAttachmentsSequentially expects Record<string, unknown> which is
  // compatible with FormData's index signature
  let attachments: EmailAttachment[] = processAttachmentsSequentiallyFn(
    attachmentMappings,
    formData as Record<string, unknown>,
  );

  // Additional user-uploaded attachments in the data/filename format
  if (formData.attachments && Array.isArray(formData.attachments)) {
    formData.attachments.forEach((attachment) => {
      if (attachment?.data && attachment?.filename) {
        const mimeType = getMimeType(attachment.filename);
        const processed = processAttachment(
          attachment.data,
          attachment.filename,
          mimeType,
        );
        if (processed) attachments.push(processed);
      }
    });
  }

  const attachmentConfigs: AttachmentConfig[] = [
    {
      filename: "Independant Contractors Agreement - Courier Lab.pdf",
      displayName: "Independant Contractors Agreement - Courier Lab.pdf",
    },
    {
      filename: "SecureCash Deed - Courier Lab.pdf",
      displayName: "SecureCash Deed - Courier Lab.pdf",
    },
  ];

  const pdfAttachments = preparePdfAttachmentsWithCache({
    attachments,
    attachmentConfigs,
    readPdfFile,
  });
  const htmlContent = icaOperationsReviewEmailTemplate(formData);
  const replyTo =
    typeof formData.Email === "string"
      ? formData.Email
      : "operations@securecash.com.au";

  return {
    to: "deepak@securecash.com.au",
    from: "operations@securecash.com.au",
    replyTo,
    subject: `Independent Contractor Agreement - ${typeof formData.Name === "string" ? formData.Name : ""}, ${typeof formData.BusinessName === "string" ? formData.BusinessName : ""}`,
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
    attachments: pdfAttachments,
  };
};

export const prepareICAContractorWelcomeEmail = (
  formData: FormData,
  readPdfFile: ReadPdfFileFn,
): PreparedEmail => {
  const attachments: EmailAttachment[] = [];
  const attachmentConfigs: AttachmentConfig[] = [
    {
      filename: "Independant Contractors Agreement - Courier Lab.pdf",
      displayName: "Independant Contractors Agreement - Courier Lab.pdf",
    },
    {
      filename: "SecureCash Deed - Courier Lab.pdf",
      displayName: "SecureCash Deed - Courier Lab.pdf",
    },
  ];

  const pdfAttachments = preparePdfAttachmentsWithCache({
    attachments,
    attachmentConfigs,
    readPdfFile,
  });
  const htmlContent = icaContractorWelcomeEmailTemplate(formData);

  const name =
    typeof formData.Name === "string"
      ? formData.Name
      : typeof formData.CompanyName === "string"
        ? formData.CompanyName
        : "Unknown";
  const business =
    typeof formData.BusinessName === "string"
      ? formData.BusinessName
      : typeof formData.CompanyName === "string"
        ? formData.CompanyName
        : "Unknown Business";

  return {
    to: typeof formData.Email === "string" ? formData.Email : undefined,
    from: "operations@securecash.com.au",
    subject: `Independent Contractor Agreement - ${name}, ${business}`,
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
    attachments: pdfAttachments,
  };
};

export const prepareICAEdocketsIntroductionEmail = (
  formData: FormData,
  readPdfFile?: ReadPdfFileFn,
): PreparedEmail => {
  const htmlContent = icaEdocketsIntroductionEmailTemplate();

  return {
    to: typeof formData.Email === "string" ? formData.Email : undefined,
    from: "info@edockets.app",
    subject: `eDocket App - ${typeof formData.Name === "string" ? formData.Name : "Name"}, ${typeof formData.BusinessName === "string" ? formData.BusinessName : "Business"}`,
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
  };
};

export const prepareQuoteAdminRequestEmail = (
  formData: FormData,
  readPdfFile?: ReadPdfFileFn,
): PreparedEmail => {
  const htmlTemplate = quoteAdminRequestEmailTemplate(formData);

  return {
    to: "deepak@securecash.com.au",
    from: "SecureCash Sales <sales@securecash.com.au>",
    subject: `SecureCash - Quotation Request (${typeof formData.Organisation === "string" ? formData.Organisation : "Unknown Organisation"})`,
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlTemplate,
  };
};

export const prepareQuoteUserConfirmationEmail = (
  formData: FormData,
  readPdfFile?: ReadPdfFileFn,
): PreparedEmail => {
  const attachments = prepareAttachments(formData);
  const htmlTemplate = quoteUserConfirmationEmailTemplate();

  return {
    to: typeof formData.Email === "string" ? formData.Email : undefined,
    from: "SecureCash Sales <sales@securecash.com.au>",
    subject: "SecureCash - Quotation Request",
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlTemplate,
    attachments: attachments.length > 0 ? attachments : undefined,
  };
};

export const prepareSiteInfoAdminNotificationEmail = (
  formData: FormData,
  readPdfFile?: ReadPdfFileFn,
): PreparedEmail => {
  const currentDateTime = getCurrentDateTime();
  const htmlContent = siteInfoAdminNotificationEmailTemplate(
    formData,
    currentDateTime,
    formatArrayField,
  );

  const businessName =
    typeof formData.BusinessName === "string" ? formData.BusinessName : "";
  const postcode =
    typeof formData.Postcode === "string" ? formData.Postcode : "";
  const type =
    typeof formData.Type === "string" ? formData.Type : "Regular Service";

  return {
    to: "deepak@securecash.com.au",
    from: "SecureCash Sign Up <sign-up@securecash.com.au>",
    subject: `Site Info - ${businessName} (${postcode}), ${type}`,
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
  };
};

export const prepareSiteInfoUserConfirmationEmail = (
  formData: FormData,
  readPdfFile: ReadPdfFileFn,
): PreparedEmail => {
  const attachments: EmailAttachment[] = [];
  const attachmentConfigs: AttachmentConfig[] = [
    {
      filename: "SecureCash-Online-Services-Flyer.pdf",
      displayName: "SecureCash Online Services Flyer.pdf",
    },
    {
      filename: "How-to-Prepare-Your-Banking.pdf",
      displayName: "How to Prepare Your Banking.pdf",
    },
  ];

  const pdfAttachments = preparePdfAttachmentsWithCache({
    attachments,
    attachmentConfigs,
    readPdfFile,
  });
  const htmlContent = siteInfoUserConfirmationEmailTemplate(formData);

  const businessName =
    typeof formData.BusinessName === "string" ? formData.BusinessName : "";
  const type =
    typeof formData.Type === "string" ? formData.Type : "Regular Service";

  return {
    to: typeof formData.Email === "string" ? formData.Email : undefined,
    from: "SecureCash Sign Up <sign-up@securecash.com.au>",
    subject: `SecureCash Business Enrolment - ${businessName} (${type})`,
    text: "Please enable HTML emails in your email client to view the contents of this email.",
    html: htmlContent,
    attachments: pdfAttachments,
  };
};

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
