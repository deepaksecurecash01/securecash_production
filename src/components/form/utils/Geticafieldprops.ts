import type { IcaFormManager } from "@/components/common/forms-new/forms/IcaForm";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface BaseIcaFieldProps {
  control: IcaFormManager["control"];
  theme: "ica";
  currentFocusField: IcaFormManager["currentFocusField"];
  onFieldFocus: IcaFormManager["handleFieldFocus"];
  onFieldBlur: IcaFormManager["handleFieldBlur"];
}

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────

/**
 * getIcaFieldProps
 *
 * Returns the 4 formManager props that every UniversalFormField in the
 * ICA form needs, spread-ready. Prevents repeating them ~15 times across
 * 6 section files.
 *
 * BEFORE (in every ICA section):
 *   <UniversalFormField
 *     name="Name"
 *     type="text"
 *     placeholder="..."
 *     Icon={FaUser}
 *     control={formManager.control}              // ← repeated
 *     theme="ica"                                // ← repeated
 *     currentFocusField={formManager.currentFocusField}  // ← repeated
 *     onFieldFocus={formManager.handleFieldFocus}        // ← repeated
 *     onFieldBlur={formManager.handleFieldBlur}          // ← repeated
 *   />
 *
 * AFTER:
 *   <UniversalFormField
 *     name="Name"
 *     type="text"
 *     placeholder="..."
 *     Icon={FaUser}
 *     {...getIcaFieldProps(formManager)}
 *   />
 *
 * Note: If you're already using IcaFormField (which injects these automatically),
 * you don't need this helper. Use one or the other, not both.
 *
 * This helper is useful when you need direct UniversalFormField access
 * (e.g. inside grid layouts or complex wrappers) without the label.
 */
const getIcaFieldProps = (formManager: IcaFormManager): BaseIcaFieldProps => ({
  control: formManager.control,
  theme: "ica",
  currentFocusField: formManager.currentFocusField,
  onFieldFocus: formManager.handleFieldFocus,
  onFieldBlur: formManager.handleFieldBlur,
});

export default getIcaFieldProps;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────
//
// PersonalDetailsSection (and all other ICA sections):
//
//   const icaProps = getIcaFieldProps(formManager);
//
//   <UniversalFormField name="Name" type="text" placeholder="..." Icon={FaUser} {...icaProps} />
//   <UniversalFormField name="Phone" type="tel" placeholder="..." Icon={FaPhone} {...icaProps} />
//   <UniversalFormField name="Email" type="email" placeholder="..." Icon={FaEnvelope} {...icaProps} />
//
// File fields — add fileUploadState manually (it's conditional):
//   <UniversalFormField
//     name="GovernmentID"
//     type="file"
//     accept="image/*"
//     fileUploadState={formManager.fileUpload}
//     {...icaProps}
//   />
