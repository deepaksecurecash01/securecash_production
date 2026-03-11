import * as Sentry from "@sentry/nextjs";

// Unexpected errors — bugs, crashes, failures
export const captureError = (
  error: unknown,
  context?: Record<string, string>,
): void => {
  if (process.env.NODE_ENV === "development") {
    console.error("[Error]", error, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    Sentry.captureException(error);
  });
};

// Expected failures worth knowing about
export const captureWarning = (
  message: string,
  context?: Record<string, string>,
): void => {
  if (process.env.NODE_ENV === "development") {
    console.warn("[Warning]", message, context);
    return;
  }

  Sentry.withScope((scope) => {
    scope.setLevel("warning");
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    Sentry.captureMessage(message);
  });
};

// Important business events — not errors, just useful signals
export const captureEvent = (
  message: string,
  context?: Record<string, string>,
): void => {
  if (process.env.NODE_ENV === "development") {
    console.log("[Event]", message, context);
    return;
  }

  Sentry.withScope((scope) => {
    scope.setLevel("info");
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    Sentry.captureMessage(message);
  });
};
