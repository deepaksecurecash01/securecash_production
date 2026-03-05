import sendgrid, { MailDataRequired } from "@sendgrid/mail";
import fs from "fs";
import path from "path";
import { RETRY_CONFIG } from "../config/constants";
import {
  calculateAttachmentSizes,
  AttachmentSizeSummary,
} from "../utils/attachments";

if (process.env.SENDGRID_API_KEY) {
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
}

interface Attachment {
  content: string;
  filename: string;
  type?: string;
  disposition?: string;
  contentId?: string;
}

export interface EmailData {
  to: string | undefined;
  from: string;
  replyTo?: string;
  subject: string;
  sendTime?: string;
  response?: string;
  text?: string;
  html?: string;
  attachments?: Attachment[];
}

export interface EmailTaskRuntime {
  id?: string;
  type: string;
  formType?: string;
  recipient?: string;
  sent?: boolean;
  prepare: () => EmailData;
  executeWithResilience?: () => Promise<BatchResult>;
}

// Public interface for queueEmail / top-level tasks.
// executeWithResilience is required — the queue will not process a task without it.
export interface EmailTask {
  type: string;
  formType: string;
  executeWithResilience: () => Promise<BatchResult>;
}

export interface EmailResult {
  to: string;
  success: boolean;
  msg?: string;
  subject?: string;
  sendTime?: string;
  response?: string;
  // Typed as AttachmentSizeSummary — the string branch in the original was unused
  attachments?: AttachmentSizeSummary;
  error?: string;
  attempt?: number;
  taskId?: string;
  recipient?: string;
}

export interface BatchResult {
  emailsSent: number;
  emailDetails: EmailResult[];
  partialSuccess?: boolean;
  totalAttempts?: number;
}

interface SendGridError extends Error {
  code?: number;
  response?: {
    status: number;
    body?: unknown;
  };
}

// SendGrid's ClientResponse type does not expose statusMessage —
// this extension avoids casting to any while preserving type safety.
interface SendGridClientResponse {
  statusCode: number;
  statusMessage?: string;
}

const emailQueue: EmailTask[] = [];
let processing = false;

const FAILED_EMAILS_DIR = path.join(process.cwd(), "failed-emails");

const ensureFailedEmailsDir = (): void => {
  try {
    if (!fs.existsSync(FAILED_EMAILS_DIR)) {
      fs.mkdirSync(FAILED_EMAILS_DIR, { recursive: true });
    }
  } catch (error) {
    console.error("Failed to create failed-emails directory:", error);
  }
};

const saveFailedEmail = (
  emailData: EmailData,
  error: unknown,
  formType: string,
): void => {
  try {
    ensureFailedEmailsDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${formType}-${timestamp}.json`;
    const filepath = path.join(FAILED_EMAILS_DIR, filename);
    const message = error instanceof Error ? error.message : String(error);

    const failedEmailRecord = {
      timestamp: new Date().toISOString(),
      formType,
      error: message,
      emailData: {
        to: emailData.to,
        subject: emailData.subject,
        from: emailData.from,
        hasAttachments: !!(
          emailData.attachments && emailData.attachments.length > 0
        ),
        attachmentCount: emailData.attachments
          ? emailData.attachments.length
          : 0,
      },
      retryable: !message.includes("Invalid email"),
    };

    fs.writeFileSync(filepath, JSON.stringify(failedEmailRecord, null, 2));
  } catch (saveError) {
    console.error("Failed to save failed email:", saveError);
  }
};

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const calculateRetryDelay = (attempt: number): number => {
  const delayMs =
    RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, attempt - 1);
  return Math.min(delayMs, RETRY_CONFIG.maxDelay);
};

export const sendEmailWithRetry = async (
  emailData: EmailData,
  formType: string,
  maxRetries = RETRY_CONFIG.maxRetries,
): Promise<EmailResult> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const startTime = performance.now();
      const response = await sendgrid.send(emailData as MailDataRequired);
      const sendTime = performance.now() - startTime;

      // Cast the first response item to our extension interface so we can
      // safely access statusMessage without using `any`.
      const firstResponse = response[0] as SendGridClientResponse | undefined;

      return {
        success: true,
        attempt,
        to: Array.isArray(emailData.to)
          ? emailData.to.join(", ")
          : (emailData.to ?? "unknown"),
        subject: emailData.subject || "No Subject",
        sendTime: sendTime.toFixed(2),
        response:
          `${firstResponse?.statusCode ?? "Unknown"} ${firstResponse?.statusMessage ?? ""}`.trim(),
        attachments: calculateAttachmentSizes(emailData),
      };
    } catch (error) {
      lastError = error;
      const err = (
        error instanceof Error ? error : new Error(String(error))
      ) as SendGridError;

      console.error(`Email attempt ${attempt}/${maxRetries} failed:`, {
        to: emailData.to,
        subject: emailData.subject,
        error: err.message,
      });

      if (
        err.code === 429 ||
        err.message.toLowerCase().includes("rate limit")
      ) {
        console.warn(`SENDGRID RATE LIMIT: ${err.message}`);
      }

      // Non-retryable errors — break immediately
      if (
        err.message.includes("Invalid email") ||
        err.message.includes("Unsubscribed Address") ||
        err.response?.status === 400 ||
        err.response?.status === 401 ||
        err.response?.status === 403 ||
        err.message.toLowerCase().includes("unauthorized") ||
        err.message.toLowerCase().includes("forbidden")
      ) {
        break;
      }

      if (attempt < maxRetries) {
        await delay(calculateRetryDelay(attempt));
      }
    }
  }

  saveFailedEmail(emailData, lastError, formType);

  return {
    success: false,
    attempt: maxRetries,
    to: Array.isArray(emailData.to)
      ? emailData.to.join(", ")
      : (emailData.to ?? "unknown"),
    subject: emailData.subject || "No Subject",
    sendTime: "0",
    response:
      lastError instanceof Error ? lastError.message : String(lastError),
    attachments: calculateAttachmentSizes(emailData),
  };
};

export const executeMultiEmailBatch = async (
  emailTasks: EmailTaskRuntime[],
  formType: string,
): Promise<BatchResult> => {
  // Initialise mutable sent flag for each task
  emailTasks.forEach((task) => {
    task.sent = false;
  });

  let retryCount = 0;
  const maxRetries = 2;
  const emailDetails: EmailResult[] = [];

  while (retryCount <= maxRetries) {
    const pendingTasks = emailTasks.filter((task) => !task.sent);
    if (pendingTasks.length === 0) break;

    const batchResults = await Promise.all(
      pendingTasks.map(async (task): Promise<EmailResult> => {
        try {
          const emailData = task.prepare();
          const result = await sendEmailWithRetry(emailData, task.type, 1);

          if (result.success) {
            task.sent = true;
          }

          return { ...result, taskId: task.id, recipient: task.recipient };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          console.error(`${formType} ${task.id} email error:`, message);

          return {
            success: false,
            taskId: task.id,
            recipient: task.recipient,
            to: "unknown",
            subject: task.id ?? formType,
            sendTime: "0",
            response: message,
            attempt: 1,
            attachments: {
              count: 0,
              totalSize: 0,
              totalSizeFormatted: "0 B",
              details: [],
            },
          };
        }
      }),
    );

    emailDetails.push(...batchResults);

    const allSent = emailTasks.every((task) => task.sent);
    if (allSent) break;

    if (retryCount < maxRetries) {
      await delay(calculateRetryDelay(retryCount + 1));
    }

    retryCount++;
  }

  const sentCount = emailTasks.filter((task) => task.sent).length;

  // Build final per-task summary using the latest result for each task
  const finalDetails: EmailResult[] = emailTasks.map((task) => {
    const latestResult = emailDetails
      .filter((detail) => detail.taskId === task.id)
      .pop();

    return {
      taskId: task.id,
      recipient: task.recipient,
      success: task.sent ?? false,
      to: latestResult?.to ?? "unknown",
      subject: latestResult?.subject ?? task.id ?? formType,
      attempt: retryCount + 1,
      sendTime: latestResult?.sendTime ?? "0",
      response: task.sent
        ? "Success"
        : (latestResult?.response ?? "Failed after retries"),
      attachments: latestResult?.attachments ?? {
        count: 0,
        totalSize: 0,
        totalSizeFormatted: "0 B",
        details: [],
      },
    };
  });

  return {
    emailsSent: sentCount,
    emailDetails: finalDetails,
    partialSuccess: sentCount > 0 && sentCount < emailTasks.length,
    totalAttempts: retryCount + 1,
  };
};

export const processEmailQueue = async (): Promise<void> => {
  if (processing || emailQueue.length === 0) return;

  processing = true;
  const queueStartTime = performance.now();

  while (emailQueue.length > 0) {
    const emailTask = emailQueue.shift();
    if (!emailTask) continue; // shift() can return undefined at boundaries

    const taskStartTime = performance.now();
    let success = false;
    let retryCount = 0;
    const maxTaskRetries = 2;

    while (!success && retryCount <= maxTaskRetries) {
      try {
        const result = await emailTask.executeWithResilience();
        const taskTime = performance.now() - taskStartTime;

        const allSuccessful = result.emailDetails.every(
          (email) => email.success,
        );

        if (allSuccessful) {
          success = true;
          console.log(
            `${emailTask.formType} emails sent: ${result.emailsSent}, ${taskTime.toFixed(2)}ms`,
          );
        } else {
          retryCount++;
          if (retryCount <= maxTaskRetries) {
            await delay(calculateRetryDelay(retryCount));
          } else {
            console.error(
              `Final batch failure for ${emailTask.formType} after ${maxTaskRetries} retries`,
            );
            break;
          }
        }
      } catch (error) {
        retryCount++;
        const message = error instanceof Error ? error.message : String(error);

        if (retryCount <= maxTaskRetries) {
          await delay(calculateRetryDelay(retryCount));
        } else {
          console.error(
            `Final batch error for ${emailTask.formType}:`,
            message,
          );
          break;
        }
      }
    }
  }

  const totalQueueTime = performance.now() - queueStartTime;
  console.log(`Email queue completed in ${totalQueueTime.toFixed(2)}ms`);

  processing = false;
};

export const queueEmail = (emailTask: EmailTask): void => {
  emailQueue.push(emailTask);
};

export const getQueueStatus = () => ({
  length: emailQueue.length,
  processing,
});
