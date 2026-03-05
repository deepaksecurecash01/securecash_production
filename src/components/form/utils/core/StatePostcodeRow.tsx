"use client";
import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import UniversalFormField from "@/components/form/UniversalFormField";
import type { FieldConfig } from "@/components/form//FieldRenderer";
import type { ThemeType } from "@/components/form//inputs/themes";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface FormManager {
  getFieldProps: (field: FieldConfig) => Record<string, unknown>;
}

interface StatePostcodeRowProps {
  formManager: FormManager;
  /** The full state field config (including options) */
  stateField: FieldConfig;
  /** The full postcode field config */
  postcodeField: FieldConfig;
  theme?: ThemeType;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * StatePostcodeRow
 *
 * Renders State (80% width) and Postcode side by side on tablet+.
 * Stacks vertically on mobile.
 *
 * Eliminates the duplicated detection/layout logic in:
 *   - SiteBusinessStep
 *   - SpecialEventBusinessStep
 *
 * Both files iterate their fields array, detect the "State" field,
 * find the "Postcode" field, render them in a flex row, and then
 * skip "Postcode" in the main loop. This component encapsulates all of that.
 */
const StatePostcodeRow = ({
  formManager,
  stateField,
  postcodeField,
  theme = "dark",
}: StatePostcodeRowProps) => (
  <div className="flex flex-col 600px:flex-row 600px:gap-4">
    <div className="600px:w-[80%]">
      <UniversalFormField
        {...(formManager.getFieldProps(stateField) as any)}
        theme={theme}
        autoComplete="new-password"
      />
    </div>
    <div>
      <UniversalFormField
        {...(formManager.getFieldProps({
          ...postcodeField,
          Icon: FaMapMarkerAlt,
        }) as any)}
        theme={theme}
        autoComplete="new-password"
      />
    </div>
  </div>
);

export default StatePostcodeRow;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────
//
// SiteBusinessStep / SpecialEventBusinessStep — replaces the special-case
// detection logic inside the fields.map():
//
//   // Instead of:
//   {fieldsWithIcons.map((field) => {
//     if (field.name === 'State') {
//       const postcodeField = fieldsWithIcons.find(f => f.name === 'Postcode');
//       return ( <div className="flex flex-col 600px:flex-row ..."> ... </div> );
//     }
//     if (field.name === 'Postcode') return null;
//     return <UniversalFormField ... />;
//   })}
//
//   // Use:
//   const stateField = fieldsWithIcons.find(f => f.name === 'State')!;
//   const postcodeField = fieldsWithIcons.find(f => f.name === 'Postcode')!;
//   const otherFields = fieldsWithIcons.filter(f => f.name !== 'State' && f.name !== 'Postcode');
//
//   <>
//     <FormFieldList fields={otherFields} formManager={formManager} theme={theme} />
//     <StatePostcodeRow
//       formManager={formManager}
//       stateField={stateField}
//       postcodeField={postcodeField}
//       theme={theme}
//     />
//   </>
