"use client";
import React from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface FormErrorBannerProps {
  error: string | null | undefined;
  showRetry?: boolean;
  className?: string;
  theme?: ErrorTheme;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * FormErrorBanner
 *
 * Displays a styled submission error message.
 * Renders null when `error` is falsy — safe to always mount.
 *
 * Replaces the near-identical error <div> blocks spread across
 * FranchiseForm, QuoteForm, AustracForm, SpecialEventForm, SiteInfoForm.
 *
 * Variants observed in the codebase:
 *   - Dark theme (dark bg forms): red-900 bg, red-400 text/border
 *   - Light theme (SiteInfoForm / SpecialEventForm): red-50 bg, red-200 border, red-600 text
 *
 * This component auto-detects nothing — pass `theme` to switch.
 */

type ErrorTheme = "dark" | "light";

const THEME_CLASSES: Record<ErrorTheme, string> = {
  dark: "text-red-400 bg-red-900 bg-opacity-20 border border-red-400",
  light: "text-red-600 bg-red-50 border border-red-200",
};

const FormErrorBanner = ({
  error,
  showRetry = false,
  className = "",
  theme = "dark",
}: FormErrorBannerProps) => {
  if (!error) return null;

  // Detect theme from className presence or default to dark
  return (
    <div
      className={`text-center mb-4 p-2 rounded mx-4 ${THEME_CLASSES[theme]} ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <strong>Submission Error:</strong> {error}
      {showRetry && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="ml-4 text-blue-600 hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default FormErrorBanner;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────
//
// Dark forms (FranchiseForm, QuoteForm, AustracForm):
//   <FormErrorBanner error={formManager.submissionError} />
//
// Light forms (SiteInfoForm, SpecialEventForm) — update these call sites:
// <FormErrorBanner error={formManager.submissionError} theme="light" showRetry />
//
// Replaces blocks like:
//   {formManager.submissionError && (
//     <div className="text-red-400 text-center mb-4 p-2 bg-red-900 bg-opacity-20 border border-red-400 rounded mx-4">
//       <strong>Submission Error:</strong> {formManager.submissionError}
//     </div>
//   )}
