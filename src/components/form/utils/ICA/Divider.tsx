import React from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface DividerProps {
  /** Horizontal alignment of the bar. Default: "center" */
  alignment?: "left" | "center" | "right";
  /** Top margin Tailwind class. Default: "mt-5" */
  margin?: string;
  /** Bottom margin Tailwind class. Default: "" */
  marginBottom?: string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * Divider
 *
 * The gold 100×4px horizontal rule used throughout the codebase.
 *
 * Previously defined inline (as a styled <hr>) in:
 *   - IcaSectionTitle (internal Divider — extracted here)
 *   - FormHeader      (<hr className="mt-5 mb-5 w-[100px] h-[4px]...">)
 *   - StepHeading     (<hr className="mt-4 w-[100px] h-[4px]...">)
 *   - SiteBusinessStep, SpecialEventBusinessStep (<hr className="w-[100px] mt-2.5 mb-4...">)
 *   - SiteServiceStep, SpecialEventServiceStep  (<hr className="w-[100px] mt-2.5 mb-4...">)
 *   - QuoteForm initial step                   (<hr className="mt-4 w-[100px] h-[4px]...">)
 *   - TermsForm                                (<hr className="w-[100px] mx-auto mt-2.5 mb-4...">)
 *
 * Defined at MODULE LEVEL (not inside a parent component) to avoid
 * React remounting it on every parent re-render.
 * See note in the original IcaSectionTitle.tsx.
 */
const Divider = ({
  alignment = "center",
  margin = "mt-5",
  marginBottom = "",
}: DividerProps) => {
  const style: React.CSSProperties = {
    width: "100px",
    height: "4px",
    borderRadius: "5px",
    backgroundColor: "var(--color-primary, #c6a54b)",
    marginLeft:
      alignment === "left" ? 0 : alignment === "right" ? "auto" : "auto",
    marginRight:
      alignment === "left" ? "auto" : alignment === "right" ? 0 : "auto",
  };

  return (
    <hr
      className={`border-0 m-0 ${margin} ${marginBottom}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export default Divider;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────
//
// IcaSectionTitle (replaces its internal Divider):
//   <Divider alignment={position === "left" ? "left" : "center"} margin="mt-[20px]" />
//
// FormHeader:
//   <Divider margin="mt-5" marginBottom="mb-5" />
//
// StepHeading (dark forms):
//   <Divider margin="mt-4" />
//
// Business / Service steps (mt-2.5 mb-4):
//   <Divider margin="mt-2.5" marginBottom="mb-4" />
//
// SiteInfoForm / SiteRiskFormFields (left-aligned):
//   <Divider alignment="left" margin="my-5" />
