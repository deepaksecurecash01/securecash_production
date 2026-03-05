import { z } from "zod";
import { CommonValidations } from "./validationHelpers";
import { FieldConfig } from "@/components/form/FieldRenderer";
import { SHARED_BUSINESS_FIELDS, SHARED_CONTACT_FIELDS, SHARED_RISK_FIELDS } from "./SharedSiteSchemas";
import { FaUniversity } from "react-icons/fa";

// ─── Step Schemas ────────────────────────────────────────────────────────────

export const BusinessInfoSchema = z.object({
  Type: z.string().default("Regular Service"), // ← added

  BusinessName: z
    .string()
    .min(2, "Business name must be at least 2 characters.")
    .max(200, "Business name is too long (maximum 200 characters)."),

  Address: CommonValidations.address(5),

  Suburb: z
    .string()
    .min(2, "Suburb must be at least 2 characters.")
    .max(100, "Suburb is too long (maximum 100 characters)."),

  State: CommonValidations.australianState(),

  Postcode: z
    .string()
    .min(1, "Postcode is required.")
    .regex(/^\d{4}$/, "Please enter a valid 4-digit postcode."),
});

export const ContactInfoSchema = z.object({
  Contact: CommonValidations.fullName(),

  Position: z
    .string()
    .min(2, "Position is required.")
    .max(100, "Position is too long (maximum 100 characters)."),

  Phone: CommonValidations.phone(8, 15),

  Email: CommonValidations.email("Location email address"),

  Accounts: CommonValidations.email("Accounts email address"),
});

export const ServiceInfoSchema = z.object({
  Services: z.array(z.string()).min(1, "Please select at least one service."),

  Dates: z
    .date({
      required_error: "Service start date is required.",
      invalid_type_error: "Service start date is required.",
    })
    .nullable()
    .refine((date) => {
      if (!date) return false; // null block karega
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, "Service start date must be today or in the future."),

  Schedule: z
    .array(z.string())
    .min(1, "Please select at least one schedule option."),

  Bank: z
    .string()
    .min(1, "Bank name is required.")
    .max(100, "Bank name is too long (maximum 100 characters)."),
});

export const RiskAssessmentSchema = z.object({
  Amount: z.string().min(1, "Please select an amount range."),
  Parking: z.array(z.string()).optional(),
  Security: z.array(z.string()).optional(),
  External: z.array(z.string()).optional(),
  Internal: z.array(z.string()).optional(),
});

// ─── Unified Multi-Step Schema Map ───────────────────────────────────────────

export const UNIFIED_SITE_INFO_SCHEMA = {
  business: BusinessInfoSchema,
  contact: ContactInfoSchema,
  service: ServiceInfoSchema,
  risk: RiskAssessmentSchema,
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type BusinessInfoData = z.infer<typeof BusinessInfoSchema>;
export type ContactInfoData = z.infer<typeof ContactInfoSchema>;
export type ServiceInfoData = z.infer<typeof ServiceInfoSchema>;
export type RiskAssessmentData = z.infer<typeof RiskAssessmentSchema>;
export type BusinessInfoInput = z.input<typeof BusinessInfoSchema>;
export type ContactInfoInput = z.input<typeof ContactInfoSchema>;
export type ServiceInfoInput = z.input<typeof ServiceInfoSchema>;
export type RiskAssessmentInput = z.input<typeof RiskAssessmentSchema>;
export type SiteInfoFormInput = BusinessInfoInput &
  ContactInfoInput &
  ServiceInfoInput &
  RiskAssessmentInput;
export type SiteInfoFormData = BusinessInfoData &
  ContactInfoData &
  ServiceInfoData &
  RiskAssessmentData;

// ─── Default Values ───────────────────────────────────────────────────────────

export const UNIFIED_DEFAULT_VALUES: SiteInfoFormInput = {
  Type: "Regular Service",
  BusinessName: "",
  Address: "",
  Suburb: "",
  State: "",
  Postcode: "",
  Contact: "",
  Position: "",
  Phone: "",
  Email: "",
  Accounts: "",
  Services: [],
  Dates: null as SiteInfoFormData["Dates"],
  Schedule: [],
  Bank: "",
  Amount: "",
  Parking: [],
  Security: [],
  External: [],
  Internal: [],
};

export const SITE_INFO_BUSINESS_FIELDS = SHARED_BUSINESS_FIELDS;
export const SITE_INFO_CONTACT_FIELDS = SHARED_CONTACT_FIELDS;
export const SITE_INFO_RISK_FIELDS = SHARED_RISK_FIELDS;

export const SITE_INFO_SERVICE_FIELDS: FieldConfig[] = [
  {
    name: "Services",
    type: "checkbox-group",
    label: "What services do you require at this location?",
    variant: "horizontal",
    options: [
      { label: "Banking", value: "Banking Courier Service" },
      { label: "Change", value: "Change Order Service" },
    ],
  },
  {
    name: "Dates",
    type: "date",
    label: "What date would you like to commence this service?",
  },
  {
    name: "Schedule",
    type: "checkbox-group",
    label:
      "Please tick both your preferred schedule days and frequency of service.",
    variant: "site-grid",
    options: [
      { label: "Monday", value: "Monday" },
      { label: "Tuesday", value: "Tuesday" },
      { label: "Wednesday", value: "Wednesday" },
      { label: "Thursday", value: "Thursday" },
      { label: "Friday", value: "Friday" },
      { label: "Saturday", value: "Saturday" },
      { label: "Sunday", value: "Sunday" },
      { label: "Weekly", value: "Weekly" },
      { label: "Fortnightly", value: "Fortnightly" },
      { label: "Monthly", value: "Monthly" },
      { label: "Ad hoc", value: "Ad Hoc" },
    ],
  },
  {
    name: "Bank",
    type: "text",
    label: "Which bank does this location use?",
    placeholder: "Eg. Commonwealth Bank",
    Icon: FaUniversity,
  },
];