import { NextResponse } from "next/server";
import { RATE_LIMIT_WINDOW } from "./config/constants";
import { USE_SYNC_EMAILS } from "./config/environment";
import { FORM_HANDLERS } from "./registry";
import {
  BatchResult,
  getQueueStatus,
  processEmailQueue,
} from "./services/emailQueue";
import {
  getPdfCacheStatus,
  initializePdfCache,
  readPdfFile,
} from "./services/pdfCache";
import { checkRateLimit, getRateLimitInfo } from "./services/rateLimit";
import { validateFormData } from "./services/validation";
import { sanitizeFormData, scanFormData } from "./utils/sanitization";

interface EmailRetryInfo {
  to: string;
  attempts: number;
  success: boolean;
}

interface ApiResponse {
  message: string;
  responseTime: string;
  environment: string;
  emailsQueued: boolean;
  emailsSentSync: boolean;
  rateLimit: { remaining: number; resetIn: string };
  emailProcessingTime?: string;
  emailsSent?: number;
  emailSuccessRate?: number;
  emailRetryInfo?: EmailRetryInfo[];
}

initializePdfCache();

export async function POST(req: Request): Promise<NextResponse> {
  const origin = req.headers.get("origin");
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    "http://localhost:3000",
  ].filter(Boolean);

  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const startTime = performance.now();

  try {
    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 },
      );
    }

    const rateLimit = checkRateLimit(req);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: 60,
          remaining: rateLimit.remaining,
        },
        { status: 429 },
      );
    }

    const { formType, ...rawData } = await req.json();
    const injectionScan = scanFormData(rawData);
    if (injectionScan) {
      return NextResponse.json(
        {
          error: "Bad request",
          field: injectionScan.field,
          reason: injectionScan.reason,
        },
        { status: 400 },
      );
    }
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : (req.headers.get("x-real-ip") ?? "unknown");

    const formData = sanitizeFormData({
      ...rawData,
      "IP Address": ip,
    });
    const parseTime = performance.now();

    if (!formType) {
      return NextResponse.json({ error: "formType required" }, { status: 400 });
    }

    const handler = FORM_HANDLERS[formType.toLowerCase()];
    if (!handler) {
      return NextResponse.json({ error: "Invalid form type" }, { status: 400 });
    }

    const validationErrors = validateFormData(formType, formData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 },
      );
    }

    let emailProcessingTime = 0;
    // BatchResult is the known type from emailQueue — no any needed
    let emailResult: BatchResult | null = null;

    if (USE_SYNC_EMAILS) {
      const emailStartTime = performance.now();
      emailResult = await handler.executeEmailsSync(formData, readPdfFile);
      emailProcessingTime = performance.now() - emailStartTime;

      console.log(`${formType.toUpperCase()} emails sent synchronously:`);
      console.log(`   Emails Sent: ${emailResult.emailsSent}`);
      console.log(`   Processing Time: ${emailProcessingTime.toFixed(2)}ms`);

      if (
        formType.toLowerCase() === "ica" ||
        emailResult.emailDetails.length > 2
      ) {
        emailResult.emailDetails.forEach((email, index) => {
          console.log(
            `   Email ${index + 1}: ${email.to} - ${email.sendTime}ms - Attempts: ${email.attempt} - ${email.success ? "✓" : "✗"}`,
          );
          if (email.attachments && email.attachments.count > 0) {
            console.log(
              `      Attachments: ${email.attachments.count} files (${email.attachments.totalSizeFormatted})`,
            );
          }
        });
      }
    } else {
      handler.queueEmails(formData, readPdfFile);
      setImmediate(() => processEmailQueue());
      emailProcessingTime = 0;
    }

    const totalTime = performance.now() - startTime;
    const parseTimeMs = parseTime - startTime;
    const processingTimeMs = totalTime - parseTimeMs - emailProcessingTime;

    const logData = handler.logData(formData);
    const performanceData = {
      ...logData,
      timestamp: new Date().toISOString(),
      environment: USE_SYNC_EMAILS ? "vercel-dev" : "production",
      rateLimit: {
        remaining: rateLimit.remaining,
        windowMinutes: RATE_LIMIT_WINDOW / 60000,
      },
      performance: {
        totalTime: `${totalTime.toFixed(2)}ms`,
        emailTime: USE_SYNC_EMAILS
          ? `${emailProcessingTime.toFixed(2)}ms`
          : "0ms (queued)",
        parseTime: `${parseTimeMs.toFixed(2)}ms`,
        processingTime: `${processingTimeMs.toFixed(2)}ms`,
        emailsQueued: !USE_SYNC_EMAILS,
        emailsSentSync: USE_SYNC_EMAILS,
      },
    };

    if (USE_SYNC_EMAILS) {
      console.log(`${formType} Performance:`, performanceData);
    } else {
      setImmediate(() => {
        console.log(`${formType} Performance:`, performanceData);
      });
    }

    const response: ApiResponse = {
      message: handler.response,
      responseTime: `${totalTime.toFixed(2)}ms`,
      environment: USE_SYNC_EMAILS ? "development" : "production",
      emailsQueued: !USE_SYNC_EMAILS,
      emailsSentSync: USE_SYNC_EMAILS,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetIn: `${RATE_LIMIT_WINDOW / 1000}s`,
      },
    };

    if (USE_SYNC_EMAILS && emailResult) {
      response.emailProcessingTime = `${emailProcessingTime.toFixed(2)}ms`;
      response.emailsSent = emailResult.emailsSent;
      // emailDetails is EmailResult[] — .success is a boolean, no any needed
      response.emailSuccessRate =
        emailResult.emailDetails.filter((e) => e.success).length /
        emailResult.emailDetails.length;
      response.emailRetryInfo = emailResult.emailDetails.map((e) => ({
        to: e.to.substring(0, 20) + "...",
        attempts: e.attempt ?? 0,
        success: e.success,
      }));
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const errorTime = performance.now() - startTime;
    const err = error instanceof Error ? error : new Error(String(error));

    console.error(`${USE_SYNC_EMAILS ? "Vercel" : "Production"} form error:`, {
      error: err.message,
      time: `${errorTime.toFixed(2)}ms`,
      stack: err.stack,
    });

    return NextResponse.json(
      {
        error: "Submission failed",
        environment: USE_SYNC_EMAILS ? "development" : "production",
        responseTime: `${errorTime.toFixed(2)}ms`,
      },
      { status: err.message?.includes("JSON") ? 400 : 500 },
    );
  }
}

export async function GET(): Promise<NextResponse> {
  const queueStatus = getQueueStatus();

  return NextResponse.json({
    environment: USE_SYNC_EMAILS
      ? "development (vercel)"
      : "production (server)",
    emailMode: USE_SYNC_EMAILS ? "synchronous" : "asynchronous",
    emailQueueLength: USE_SYNC_EMAILS ? "N/A (sync mode)" : queueStatus.length,
    processing: USE_SYNC_EMAILS ? "N/A (sync mode)" : queueStatus.processing,
    pdfCacheStatus: getPdfCacheStatus(),
    rateLimitInfo: getRateLimitInfo(),
    timestamp: new Date().toISOString(),
    vercelEnv: process.env.VERCEL_ENV || "not-vercel",
  });
}
