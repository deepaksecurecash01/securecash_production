import { MIME_TYPES, MAX_ATTACHMENT_SIZE } from "../config/constants";

export interface ProcessedAttachment {
  filename: string;
  type: string;
  disposition: string;
  content: string; // base64 string
}

interface AttachmentMapping {
  field: string;
  filename: string;
}

interface EmailDataForSize {
  attachments?: Array<{
    content?: string | Buffer;
    filename?: string;
    type?: string;
  }>;
}

export interface AttachmentSizeDetail {
  filename: string;
  size: number;
  sizeFormatted: string;
  type: string;
}

export interface AttachmentSizeSummary {
  count: number;
  totalSize: number;
  totalSizeFormatted: string;
  details: AttachmentSizeDetail[];
}

/**
 * Resolves the MIME type for a given filename based on its extension.
 * Falls back to "application/octet-stream" for unknown extensions.
 */
export const getMimeType = (filename: string): string => {
  const extension = filename.toLowerCase().split(".").pop() ?? "";
  // MIME_TYPES is already Record<string, string> — no assertion needed
  return MIME_TYPES[extension] ?? "application/octet-stream";
};

/**
 * Converts a raw attachment string (base64, optionally with a data URI prefix)
 * into a structured attachment object ready for SendGrid.
 * Returns null if the input is falsy or an error occurs during processing.
 */
export const processAttachment = (
  attachment: string | null | undefined,
  filename: string,
  mimeType: string = "application/pdf",
): ProcessedAttachment | null => {
  if (!attachment) return null;

  try {
    // Strip the data URI prefix (e.g. "data:application/pdf;base64,") if present
    const base64Content = attachment.includes(",")
      ? attachment.split(",")[1]
      : attachment;

    return {
      filename,
      type: mimeType,
      disposition: "attachment",
      content: base64Content,
    };
  } catch (error) {
    console.error(`Error processing attachment ${filename}:`, error);
    return null;
  }
};

/**
 * Iterates over an ordered list of field→filename mappings and converts each
 * matching form field into a ProcessedAttachment.
 *
 * Processes one attachment at a time (sequentially) to keep peak memory low
 * when handling large files. Skips mappings whose field is absent in formData.
 *
 * formData is typed as Record<string, unknown> because it originates from
 * req.json() — callers must not assume any specific shape beyond the mappings.
 */
export const processAttachmentsSequentially = (
  attachmentMappings: AttachmentMapping[],
  formData: Record<string, unknown>,
): ProcessedAttachment[] => {
  const attachments: ProcessedAttachment[] = [];

  for (const mapping of attachmentMappings) {
    const fieldValue = formData[mapping.field];
    if (!fieldValue) continue;

    // Narrow from unknown to string before passing to processAttachment
    if (typeof fieldValue !== "string") {
      console.warn(
        `Attachment field "${mapping.field}" is not a string — skipping.`,
      );
      continue;
    }

    try {
      const mimeType = getMimeType(mapping.filename);
      const processedAttachment = processAttachment(
        fieldValue,
        mapping.filename,
        mimeType,
      );
      if (processedAttachment) {
        attachments.push(processedAttachment);
      }

      // Hint to V8 to release the base64 string from the previous iteration
      // if a GC is already scheduled. Only available when --expose-gc is set.
      if (global.gc) {
        global.gc();
      }
    } catch (error) {
      console.error(`Error processing attachment ${mapping.filename}:`, error);
    }
  }

  return attachments;
};

/**
 * Formats a byte count into a human-readable size string (B, KB, MB, GB).
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Calculates the size and metadata for each attachment in an email payload.
 * Returns a summary with per-file details and a formatted total size.
 */
export const calculateAttachmentSizes = (
  emailData: EmailDataForSize,
): AttachmentSizeSummary => {
  if (!emailData.attachments || !Array.isArray(emailData.attachments)) {
    return { count: 0, totalSize: 0, totalSizeFormatted: "0 B", details: [] };
  }

  const details: AttachmentSizeDetail[] = emailData.attachments.map(
    (attachment) => {
      const size = attachment.content
        ? typeof attachment.content === "string"
          ? Buffer.byteLength(attachment.content, "base64")
          : attachment.content.length
        : 0;

      return {
        filename: attachment.filename ?? "unknown",
        size,
        sizeFormatted: formatFileSize(size),
        type: attachment.type ?? "unknown",
      };
    },
  );

  const totalSize = details.reduce((sum, att) => sum + att.size, 0);

  return {
    count: details.length,
    totalSize,
    totalSizeFormatted: formatFileSize(totalSize),
    details,
  };
};
