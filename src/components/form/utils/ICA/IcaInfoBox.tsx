"use client";
import React from "react";
import { FaInfoCircle } from "react-icons/fa";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type InfoBoxVariant = "light" | "dark" | "signed";

interface IcaInfoBoxProps {
  children: React.ReactNode;
  /**
   * "light"  — grey bg, dark text  (PersonalDetailsSection beneficiary info,
   *             DeedOfGuaranteeSection, ExecutedAsDeedSection, DriversSection)
   * "dark"   — dark bg, white text (PersonalDetailsSection info banner)
   * "signed" — light with "SIGNED, SEALED and DELIVERED" header label
   */
  variant?: InfoBoxVariant;
  /** Padding size. Default: "p-6" */
  padding?: "p-4" | "p-6";
  /** Show the FaInfoCircle icon prefix (dark variant only). Default: false */
  showIcon?: boolean;
  /** Extra Tailwind classes */
  className?: string;
}

// ─────────────────────────────────────────────
// Variant styles
// ─────────────────────────────────────────────

const VARIANT_CLASSES: Record<InfoBoxVariant, string> = {
  light: "bg-[rgb(242,242,242,0.9)] text-gray-700",
  dark: "bg-dark-border/90 text-white text-sm",
  signed: "bg-[rgb(242,242,242,0.9)] text-gray-700",
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * IcaInfoBox
 *
 * Rounded card for read-only informational content inside ICA sections.
 *
 * Used as:
 *   - Grey light box: DeedOfGuaranteeSection (beneficiary block),
 *     ExecutedAsDeedSection (signed/sealed header), DriversSection (code input wrapper)
 *   - Dark banner: PersonalDetailsSection (copy of agreement notice)
 *   - p-4 variant: DeedOfGuaranteeSection recitals list
 */
const IcaInfoBox = ({
  children,
  variant = "light",
  padding = "p-6",
  showIcon = false,
  className = "",
}: IcaInfoBoxProps) => (
  <div
    className={["rounded-lg", padding, VARIANT_CLASSES[variant], className]
      .filter(Boolean)
      .join(" ")}
  >
    {showIcon && variant === "dark" && (
      <FaInfoCircle className="inline mr-2" aria-hidden="true" />
    )}
    {children}
  </div>
);

export default IcaInfoBox;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────
//
// PersonalDetailsSection — dark info banner:
//   <IcaInfoBox variant="dark" padding="p-4" showIcon>
//     A copy of this agreement will be sent to the address provided.
//   </IcaInfoBox>
//
// DeedOfGuaranteeSection — beneficiary block:
//   <IcaInfoBox variant="light">
//     <p className="text-gray-700">
//       {COMPANY_INFO.name.toUpperCase()} of <br />{COMPANY_INFO.address}
//     </p>
//   </IcaInfoBox>
//
// ExecutedAsDeedSection — signed/sealed header:
//   <IcaInfoBox variant="light">
//     <p className="text-sm text-gray-700 mb-4 font-medium">
//       SIGNED, SEALED and DELIVERED by:
//     </p>
//     ...fields
//   </IcaInfoBox>
//
// DeedOfGuaranteeSection — recitals list:
//   <IcaInfoBox variant="light" padding="p-4">
//     <ul>...</ul>
//   </IcaInfoBox>
