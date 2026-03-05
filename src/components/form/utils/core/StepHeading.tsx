"use client";
import React from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type HeadingSize = "sm" | "md" | "lg";
type HeadingTag = "h1" | "h2" | "h3";

interface StepHeadingProps {
  /** The heading text */
  title: string;
  /** Optional subtitle rendered below the title, above the divider */
  subtitle?: string;
  /** Heading font size. sm=22px, md=26px, lg=32px. Default: "md" */
  size?: HeadingSize;
  /** HTML heading tag. Default: "h2" */
  as?: HeadingTag;
  /** Show the gold divider HR. Default: true */
  showDivider?: boolean;
  /** Extra Tailwind classes */
  className?: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const SIZE_CLASSES: Record<HeadingSize, string> = {
  sm: "text-[22px]",
  md: "text-[26px]",
  lg: "text-[32px] leading-[30px]",
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * StepHeading
 *
 * White centred heading + gold 100px HR divider used across all
 * dark-theme step components (BankingStep, ChangeStep, SiteBusinessStep,
 * SiteContactStep, SiteServiceStep, SpecialEventBusinessStep,
 * SpecialEventContactStep, SpecialEventServiceStep, TermsForm).
 *
 * Also handles the FranchiseForm success variant (lg size, light bg).
 */
const StepHeading = ({
  title,
  subtitle,
  size = "md",
  as: Tag = "h2",
  showDivider = true,
  className = "",
}: StepHeadingProps) => (
  <div className={`text-center ${className}`}>
    <Tag
      className={`text-white font-normal capitalize pb-4 ${SIZE_CLASSES[size]} leading-[30px] font-montserrat`}
    >
      {title}
    </Tag>

    {subtitle && (
      <p className="text-white font-normal capitalize pb-4 text-[16px] font-montserrat">
        {subtitle}
      </p>
    )}

    {showDivider && (
      <hr
        className="mt-4 w-[100px] h-[4px] rounded-[5px] border-0 bg-primary mx-auto"
        aria-hidden="true"
      />
    )}
  </div>
);

export default StepHeading;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────
//
// BankingStep / ChangeStep:
//   <StepHeading title="Banking" as="h3" size="sm" />
//   <StepHeading title="Change" as="h3" size="sm" />
//
// SiteBusinessStep / SpecialEventBusinessStep:
//   <StepHeading title="Business Information" as="h1" />
//
// SiteContactStep / SpecialEventContactStep:
//   <StepHeading title="Contact Information" as="h1" />
//
// SiteServiceStep / SpecialEventServiceStep:
//   <StepHeading title="Other Information" as="h1" />
//
// QuoteForm initial step:
//   <StepHeading
//     title="Want a quote from SecureCash?"
//     subtitle="We Just Need A Few Details"
//     as="h2"
//   />
//
// TermsForm:
//   <StepHeading title="Service Agreement" as="h3" size="md" />
//   (note: TermsForm uses font-normal not font-semibold — matches default)
