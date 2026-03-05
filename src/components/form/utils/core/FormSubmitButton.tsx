"use client";
import React from "react";
import { FaSpinner, FaCheckCircle } from "react-icons/fa";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ButtonVariant = "primary" | "ica";

export interface FormSubmitButtonProps {
  /** Is the form currently submitting? */
  isSubmitting: boolean;
  /** Has the form been successfully submitted? */
  isSubmitted: boolean;
  /** Label shown in the idle (default) state */
  idleLabel?: string;
  /** Label shown while submitting */
  submittingLabel?: string;
  /** Label shown after a successful submission */
  submittedLabel?: string;
  /**
   * "primary" — full-width pill button (FranchiseForm, QuoteForm, TermsForm, AustracForm, SiteRiskFormFields)
   * "ica"     — auto-width pill button (IcaForm)
   */
  variant?: ButtonVariant;
  /** Extra Tailwind classes for one-off overrides */
  className?: string;
  disabled?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
}

// ─────────────────────────────────────────────
// Variant style maps
// ─────────────────────────────────────────────

const BASE =
  "nextBtn text-white border-none py-[15px] text-[17px] cursor-pointer rounded-[40px] outline-none appearance-none hover:opacity-80 p-2.5 shadow-none font-montserrat disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "w-full px-[50px] text-sm",
  ica: "px-[50px] text-base 480px:px-[50px]",
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

const FormSubmitButton = ({
  isSubmitting,
  isSubmitted,
  idleLabel = "Submit",
  submittingLabel = "Submitting... Please Wait.",
  submittedLabel = "Thank you, form submitted successfully!",
  variant = "primary",
  className = "",
  disabled,
  type = "submit",
  onClick,
}: FormSubmitButtonProps) => {
  const colorClass = isSubmitted ? "bg-[#4bb543]" : "bg-[#c6a54b]";

  return (
    <button
      type={type}
      disabled={disabled ?? isSubmitting}
      onClick={onClick}
      className={[BASE, colorClass, VARIANT_CLASSES[variant], className]
        .filter(Boolean)
        .join(" ")}
    >
      {isSubmitting ? (
        <span className="flex items-center justify-center gap-2">
          <FaSpinner className="animate-spin" aria-hidden="true" />
          {submittingLabel}
        </span>
      ) : isSubmitted ? (
        <span className="flex items-center justify-center gap-2">
          <FaCheckCircle className="text-white" aria-hidden="true" />
          {submittedLabel}
        </span>
      ) : (
        idleLabel
      )}
    </button>
  );
};

export default FormSubmitButton;

// ─────────────────────────────────────────────
// Usage Examples
// ─────────────────────────────────────────────
//
// FranchiseForm / AustracForm (default):
//   <FormSubmitButton
//     isSubmitting={formManager.isSubmitting}
//     isSubmitted={formManager.isSubmitted}
//     idleLabel="Submit"
//   />
//
// TermsForm:
//   <FormSubmitButton
//     isSubmitting={formManager.isSubmitting}
//     isSubmitted={formManager.isSubmitted}
//     idleLabel="I agree with the above Terms & Conditions"
//     submittingLabel="Submitting, please wait..."
//     submittedLabel="Thank you, we received your submission!"
//   />
//
// IcaForm:
//   <FormSubmitButton
//     isSubmitting={formManager.isSubmitting}
//     isSubmitted={formManager.isSubmitted}
//     idleLabel="Click here to execute this deed & agreement"
//     submittedLabel="Thank you. We received your submission!"
//     variant="ica"
//   />
//
// QuoteForm (dynamic label):
//   <FormSubmitButton
//     isSubmitting={formManager.isSubmitting}
//     isSubmitted={formManager.isSubmitted}
//     idleLabel={getButtonLabel()} // "Next" or "Submit"
//     submittingLabel="Submitting..."
//   />
