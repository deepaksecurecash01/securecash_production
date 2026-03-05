"use client";
import React from "react";
import { FaChevronLeft } from "react-icons/fa";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface FormBackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * FormBackButton
 *
 * Chevron-left + "Back" label used as the previous-step navigation
 * in QuoteForm, SiteInfoForm, and SpecialEventForm.
 *
 * Positioned absolutely at top-left of the form card in all three
 * forms — pass className to override positioning if needed.
 */
const FormBackButton = ({
  onClick,
  label = "Back",
  className = "form-slide-btn-wrap mb-4 absolute",
}: FormBackButtonProps) => (
  <div className={className}>
    <button
      type="button"
      onClick={onClick}
      className="flex items-center text-white hover:text-[#c6a54b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
      aria-label={`Go back to previous step`}
    >
      <FaChevronLeft className="mr-2" aria-hidden="true" />
      <span>{label}</span>
    </button>
  </div>
);

export default FormBackButton;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────
//
// QuoteForm:
//   {!isFirst && stepId !== "risk" && !formManager.isSubmitted && (
//     <FormBackButton onClick={formManager.goBack} />
//   )}
//
// SiteInfoForm / SpecialEventForm:
//   {!isFirst && stepId !== "risk" && (
//     <FormBackButton onClick={formManager.goBack} />
//   )}
