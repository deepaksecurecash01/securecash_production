import { getMimeType, ProcessedAttachment } from "../utils/attachments";


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

export interface EmailAttachment {
  content: string;
  filename: string;
  type: string;
  disposition: string;
  content_id?: string;
}

export interface PreparedEmail {
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
export type ProcessAttachmentsSequentiallyFn = (
  mappings: { field: string; filename: string }[],
  formData: Record<string, unknown>,
) => ProcessedAttachment[];

// ─── INTERNAL HELPERS ─────────────────────────────────────────────────────────

export interface AttachmentConfig {
  filename: string;
  displayName: string;
}

export const preparePdfAttachmentsWithCache = ({
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

export const prepareAttachments = (formData: FormData): EmailAttachment[] => {
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
