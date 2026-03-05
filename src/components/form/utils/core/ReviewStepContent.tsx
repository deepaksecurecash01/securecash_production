"use client";
import React from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface ReviewStepContentProps {
  /** Called when the user clicks "Edit Form". Use onMouseDown to avoid form submit race. */
  onEdit: (e: React.MouseEvent) => void;
  /** Heading text. Default: "Review & Edit Previous Steps" */
  heading?: string;
  /** Button label. Default: "Edit Form" */
  buttonLabel?: string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * ReviewStepContent
 *
 * The review/edit interstitial shown at the hybrid "risk" step
 * in SiteInfoForm and SpecialEventForm.
 *
 * Uses onMouseDown (not onClick) so the edit handler fires before
 * the form's onSubmit can race with the button click.
 */
const ReviewStepContent = ({
  onEdit,
  heading = "Review & Edit Previous Steps",
  buttonLabel = "Edit Form",
}: ReviewStepContentProps) => (
  <div className="h-full flex flex-col items-center justify-center gap-2">
    <h2 className="text-white font-normal text-center capitalize pb-4 text-[26px] leading-[30px] font-montserrat">
      {heading}
    </h2>
    <div>
      <button
        type="button"
        onMouseDown={onEdit}
        className="nextBtn bg-[#c6a54b] text-white border-none py-[15px] px-[50px] text-[17px] cursor-pointer w-full rounded-[40px] outline-none appearance-none hover:opacity-80 text-sm p-2.5 shadow-none font-montserrat"
      >
        {buttonLabel}
      </button>
    </div>
  </div>
);

export default ReviewStepContent;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────
//
// SiteInfoForm & SpecialEventForm — replaces the local ReviewStepContent:
//
//   const renderCurrentStep = () => {
//     if (stepId === "risk") {
//       return <ReviewStepContent onEdit={handleEditForm} />;
//     }
//     ...
//   };
