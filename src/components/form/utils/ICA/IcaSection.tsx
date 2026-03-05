"use client";
import React from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface IcaSectionProps {
  children: React.ReactNode;
  /** Remove the bottom border (use on the last section). Default: false */
  isLast?: boolean;
  /** Extra Tailwind classes */
  className?: string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * IcaSection
 *
 * Outer container shared by every ICA form section:
 *   PersonalDetailsSection, AgreementTermSection, DeedOfGuaranteeSection,
 *   ExecutedAsDeedSection, LicensingInsuranceSection, (DriversSection has no border-b)
 *
 * Wraps children in:
 *   <div className="space-y-6 border-b border-dark-border/30 pb-12">
 *
 * Pass isLast={true} to drop the bottom border (DriversSection).
 */
const IcaSection = ({
  children,
  isLast = false,
  className = "",
}: IcaSectionProps) => (
  <div
    className={[
      "space-y-6 pb-12",
      isLast ? "" : "border-b border-dark-border/30",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    {children}
  </div>
);

export default IcaSection;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────
//
// PersonalDetailsSection (with border):
//   <IcaSection>
//     <IcaSectionTitle Icon={FaUser}>Personal Details</IcaSectionTitle>
//     ...fields
//   </IcaSection>
//
// DriversSection (last, no border):
//   <IcaSection isLast>
//     <IcaSectionTitle ...>Let's get set up for contracting</IcaSectionTitle>
//     ...content
//   </IcaSection>
