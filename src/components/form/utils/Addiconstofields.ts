import type { FieldConfig } from "@/components/form//FieldRenderer";
import type { IconType } from "react-icons";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type IconMap = Record<string, IconType | undefined>;

// ─────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────

/**
 * addIconsToFields
 *
 * Maps icon components onto a fields array by field name.
 * Fields with no matching key in iconMap are left with their
 * existing Icon (or undefined if they had none).
 *
 * Consolidates the local `getFieldIcon` + `.map()` pattern
 * repeated across 4 step files:
 *   - SiteBusinessStep
 *   - SiteContactStep
 *   - SpecialEventBusinessStep
 *   - SpecialEventContactStep
 *
 * Also formalises the simpler `addIconToFields` helper
 * already present in SiteRiskFormFields.
 *
 * @param fields   - Array of FieldConfig objects
 * @param iconMap  - { [fieldName]: IconComponent }
 * @returns        - New array with Icon property merged in
 */
const addIconsToFields = (
  fields: FieldConfig[],
  iconMap: IconMap,
): FieldConfig[] =>
  fields.map((field) => ({
    ...field,
    ...(iconMap[field.name] !== undefined ? { Icon: iconMap[field.name] } : {}),
  }));

export default addIconsToFields;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────
//
// SiteBusinessStep / SpecialEventBusinessStep:
//
//   import { FaBuilding, FaHome, FaMapMarkerAlt } from 'react-icons/fa';
//   import addIconsToFields from '@/utils/addIconsToFields';
//
//   const BUSINESS_ICON_MAP = {
//     BusinessName: FaBuilding,
//     Address: FaHome,
//     Suburb: FaMapMarkerAlt,
//     State: FaMapMarkerAlt,
//     Postcode: FaMapMarkerAlt,
//   };
//
//   const fieldsWithIcons = addIconsToFields(BUSINESS_INFO_FIELDS, BUSINESS_ICON_MAP);
//
//
// SiteContactStep / SpecialEventContactStep:
//
//   import { FaUser, FaUsers, FaPhone, FaEnvelope } from 'react-icons/fa';
//
//   const CONTACT_ICON_MAP = {
//     Contact: FaUser,
//     Position: FaUsers,
//     Phone: FaPhone,
//     Email: FaEnvelope,
//     Accounts: FaEnvelope,
//   };
//
//   const fieldsWithIcons = addIconsToFields(CONTACT_INFO_FIELDS, CONTACT_ICON_MAP);
//
//
// SiteRiskFormFields (replaces existing addIconToFields):
//
//   import { FaMoneyBillAlt } from 'react-icons/fa';
//
//   const fieldsWithIcons = addIconsToFields(SHARED_RISK_FIELDS, {
//     Amount: FaMoneyBillAlt,
//   });
