"use client";
import React from "react";
import UniversalFormField from "@/components/form/UniversalFormField";
import type { FieldConfig } from "@/components/form//FieldRenderer";
import type { ThemeType } from "@/components/form//inputs/themes";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface FormManager {
  getFieldProps: (field: FieldConfig) => Record<string, unknown>;
}

interface FormFieldListProps {
  /** Array of field config objects */
  fields: FieldConfig[];
  /** useFormManager instance (or any object with getFieldProps) */
  formManager: FormManager;
  /** Theme passed to every UniversalFormField */
  theme: ThemeType;
  /**
   * Wrapper div className for each field.
   * Default: "relative flex flex-col h-full justify-between"
   */
  fieldWrapperClass?: string;
  /** autoComplete value. Default: "new-password" */
  autoComplete?: string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * FormFieldList
 *
 * Renders a uniform list of UniversalFormField components from a fields array.
 * Eliminates the `.map()` boilerplate repeated in every form and step file.
 *
 * Used in: FranchiseForm, QuoteForm (initial step), TermsForm, AustracForm,
 *          BankingStep, ChangeStep, SiteContactStep, SiteServiceStep,
 *          SpecialEventContactStep, SpecialEventServiceStep
 */
const FormFieldList = ({
  fields,
  formManager,
  theme,
  fieldWrapperClass = "relative flex flex-col h-full justify-between",
  autoComplete = "new-password",
}: FormFieldListProps) => (
  <>
    {fields.map((field) => (
      <div key={field.name} className={fieldWrapperClass}>
        <UniversalFormField
          {...(formManager.getFieldProps(field) as any)}
          theme={theme}
          autoComplete={autoComplete}
        />
      </div>
    ))}
  </>
);

export default FormFieldList;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────
//
// FranchiseForm (light):
//   <FormFieldList fields={INPUT_FIELDS} formManager={formManager} theme="light" />
//
// QuoteForm initial step (dark):
//   <FormFieldList fields={QUOTE_FIELDS} formManager={formManager} theme="dark" />
//
// AustracForm (dark):
//   <FormFieldList fields={INPUT_FIELDS} formManager={formManager} theme="dark" />
//
// BankingStep:
//   <FormFieldList fields={bankingFields} formManager={formManager} theme={theme} />
//
// ChangeStep:
//   <FormFieldList fields={changeFields} formManager={formManager} theme={theme} />
//
// Note: Steps with special layout logic (StatePostcodeRow, conditional fields)
// should NOT use FormFieldList for those specific fields — only for the
// straightforward portion of the field list.
