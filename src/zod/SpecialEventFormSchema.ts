import { FieldConfig } from "@/components/form/FieldRenderer";
import { z } from "zod";
import { SHARED_BUSINESS_FIELDS, SHARED_CONTACT_FIELDS, SHARED_RISK_FIELDS } from "./SharedSiteSchemas";
import { FaUniversity } from "react-icons/fa";

export const SpecialEventBusinessInfoSchema = z.object({
  Type: z.string().default("Regular Service"), // ← added

  BusinessName: z
    .string()
    .min(1, "Please enter the business name of this location."),
  Address: z
    .string()
    .min(1, "Please enter the number & street for this location."),
  Suburb: z.string().min(1, "Please enter the suburb for this location."),
  State: z
    .string()
    .min(1, "Please enter the state this is located in.")
    .refine((val) => val !== "select", "Please select a state."),
  Postcode: z.string().min(1, "Please enter the post code for this location."),
});

export const SpecialEventContactInfoSchema = z.object({
  Contact: z
    .string()
    .min(1, "Please enter the main contact person at this location."),
  Position: z
    .string()
    .min(
      1,
      "Please enter the main contact person position or role at this location.",
    ),
  Phone: z.string().min(1, "Please enter their best contact number."),
  Email: z
    .string()
    .min(1, "Please enter the email address at this location.")
    .email("Please enter a valid email address."),
  Accounts: z
    .string()
    .min(1, "Please enter the email address to send accounts.")
    .email("Please enter a valid email address."),
});

export const SpecialEventServiceInfoSchema = z.object({
  Services: z
    .array(z.string())
    .min(1, "Please select what services you require."),
  Dates: z.string().min(1, "Please enter the dates and times for this event."),

  Bank: z.string().min(1, "Please enter the bank this location uses."),
});

export const SpecialEventRiskAssessmentSchema = z.object({
  Amount: z.string().min(1, "Please select an average notes value."),
  Parking: z.array(z.string()).optional(),
  Security: z.array(z.string()).optional(),
  External: z.array(z.string()).optional(),
  Internal: z.array(z.string()).optional(),
});

export const UNIFIED_SPECIAL_EVENT_SCHEMA = {
  business: SpecialEventBusinessInfoSchema,
  contact: SpecialEventContactInfoSchema,
  service: SpecialEventServiceInfoSchema,
  risk: SpecialEventRiskAssessmentSchema,
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type BusinessInfoData = z.infer<typeof SpecialEventBusinessInfoSchema>;
export type ContactInfoData = z.infer<typeof SpecialEventContactInfoSchema>;
export type ServiceInfoData = z.infer<typeof SpecialEventServiceInfoSchema>;
export type RiskAssessmentData = z.infer<
  typeof SpecialEventRiskAssessmentSchema
>;
export type BusinessInfoInput = z.input<typeof SpecialEventBusinessInfoSchema>;
export type ContactInfoInput = z.input<typeof SpecialEventContactInfoSchema>;
export type ServiceInfoInput = z.input<typeof SpecialEventServiceInfoSchema>;
export type RiskAssessmentInput = z.input<
  typeof SpecialEventRiskAssessmentSchema
>;
export type SpecialEventFormInput = BusinessInfoInput &
  ContactInfoInput &
  ServiceInfoInput &
  RiskAssessmentInput;
export type SpecialEventFormData = BusinessInfoData &
  ContactInfoData &
  ServiceInfoData &
  RiskAssessmentData;

export const UNIFIED_SPECIAL_EVENT_DEFAULT_VALUES: SpecialEventFormInput = {
  Type: "Special Event",
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
  Dates: "",
  Bank: "",
  Amount: "",
  Parking: [],
  Security: [],
  External: [],
  Internal: [],
};

export const SPECIAL_EVENT_BUSINESS_FIELDS = SHARED_BUSINESS_FIELDS;
export const SPECIAL_EVENT_CONTACT_FIELDS = SHARED_CONTACT_FIELDS;
export const SPECIAL_EVENT_RISK_FIELDS = SHARED_RISK_FIELDS;


export const SPECIAL_EVENT_SERVICE_FIELDS: FieldConfig[] = [
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
    type: "textarea",
    label:
      "Please provide us with a list of the dates, times & any other relevant information for the event below;",
    placeholder: "Enter dates, times and other relevant information...",
    rows: 6,
  },
  {
    name: "Bank",
    type: "text",
    label: "Which bank does this location use?",
    placeholder: "Eg. Commonwealth Bank",
    Icon: FaUniversity,
  },
];