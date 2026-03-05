"use client";
import React from "react";
import { Controller, Control } from "react-hook-form";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface HoneypotFieldProps {
  /** react-hook-form control object from useFormManager or useForm */
  control: Control<any>;
  /** Field name — defaults to "BotField", override only if schema uses a different key */
  name?: string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * HoneypotField
 *
 * Renders a hidden text input that real users never see or fill in.
 * Bots that auto-fill all fields will populate it, allowing server-side
 * detection and rejection of spam submissions.
 *
 * Replaces the identical <Controller name="BotField" ...> block that was
 * copy-pasted verbatim across 7 form files.
 */
const HoneypotField = ({ control, name = "BotField" }: HoneypotFieldProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <input
        {...field}
        type="text"
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
    )}
  />
);

export default HoneypotField;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────
//
// Replaces this block in every form / step:
//
//   <Controller
//     name="BotField"
//     control={formManager.control}
//     render={({ field }) => (
//       <input
//         {...field}
//         type="text"
//         style={{ display: "none" }}
//         tabIndex={-1}
//         autoComplete="off"
//         aria-hidden="true"
//       />
//     )}
//   />
//
// With:
//
//   <HoneypotField control={formManager.control} />
//
// Files affected:
//   FranchiseForm, QuoteForm, TermsForm, AustracForm,
//   IcaForm, SiteBusinessStep, SpecialEventBusinessStep
