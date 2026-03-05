import type { FieldConfig } from "@/components/form/FieldRenderer";
import {
  FaBuilding,
  FaEnvelope,
  FaHome,
  FaMapMarkerAlt,
  FaMoneyBillAlt,
  FaPhone,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import { z } from "zod";
import { CommonValidations } from "./validationHelpers";

export const SharedSubmissionTypeSchema = z.object({
  Type: z.string().min(1),
});

export const SharedBusinessInfoSchema = z.object({
  BusinessName: z.string().min(1, "Business name is required."),
  Address: z.string().min(1, "Address is required."),
  Suburb: z.string().min(1, "Suburb is required."),
  State: CommonValidations.australianState(),
  Postcode: z.string().min(1, "Postcode is required."),
});

export const SharedContactInfoSchema = z.object({
  Contact: z.string().min(1, "Contact person is required."),
  Position: z.string().min(1, "Position is required."),
  Phone: CommonValidations.phone(8, 15),
  Email: CommonValidations.email("Email address"),
  Accounts: CommonValidations.email("Accounts email"),
});

export const SharedRiskAssessmentSchema = z.object({
  Amount: z.string().min(1, "Please select an amount range."),
  Parking: z.array(z.string()).optional(),
  Security: z.array(z.string()).optional(),
  External: z.array(z.string()).optional(),
  Internal: z.array(z.string()).optional(),
});

export type SharedSubmissionTypeData = z.infer<
  typeof SharedSubmissionTypeSchema
>;
export type SharedSubmissionTypeInput = z.input<
  typeof SharedSubmissionTypeSchema
>;

export type SharedBusinessInfoData = z.infer<typeof SharedBusinessInfoSchema>;
export type SharedBusinessInfoInput = z.input<typeof SharedBusinessInfoSchema>;

export type SharedContactInfoData = z.infer<typeof SharedContactInfoSchema>;
export type SharedContactInfoInput = z.input<typeof SharedContactInfoSchema>;

export type SharedRiskAssessmentData = z.infer<
  typeof SharedRiskAssessmentSchema
>;
export type SharedRiskAssessmentInput = z.input<
  typeof SharedRiskAssessmentSchema
>;

export const SHARED_BUSINESS_FIELDS: FieldConfig[] = [
  {
    name: "BusinessName",
    type: "text",
    label: "What is the business name of this location?",
    placeholder: "e.g. Joes Supermarket",
    Icon: FaBuilding,
  },
  {
    name: "Address",
    type: "text",
    label: "What is the number & street for this location?",
    placeholder: "e.g. 49 Commercial Road",
    Icon: FaHome,
  },
  {
    name: "Suburb",
    type: "text",
    label: "What is the suburb for this location?",
    placeholder: "e.g. Port Adelaide",
    Icon: FaMapMarkerAlt,
  },
  {
    name: "State",
    type: "select",
    label: "What state is this location in?",
    Icon: FaMapMarkerAlt,
    options: [
      { value: "select", label: "Please Select" },
      { value: "VIC", label: "Victoria" },
      { value: "NSW", label: "New South Wales" },
      { value: "QLD", label: "Queensland" },
      { value: "WA", label: "Western Australia" },
      { value: "SA", label: "South Australia" },
      { value: "TAS", label: "Tasmania" },
      { value: "ACT", label: "Australian Capital Territory" },
      { value: "NT", label: "Northern Territory" },
      { value: "NZ", label: "New Zealand" },
    ],
  },
  {
    name: "Postcode",
    type: "text",
    label: "Postcode",
    placeholder: "e.g. 5015",
    Icon: FaMapMarkerAlt,
  },
];

export const SHARED_CONTACT_FIELDS: FieldConfig[] = [
  {
    name: "Contact",
    type: "text",
    label: "Who will be the main contact person at this location?",
    placeholder: "e.g. Usually the Manager or Supervisor",
    Icon: FaUser,
  },
  {
    name: "Position",
    type: "text",
    label: "What is their position or role at this location?",
    placeholder: "e.g. Manager, Finance Officer, etc",
    Icon: FaUsers,
  },
  {
    name: "Phone",
    type: "tel",
    label: "What is their best contact number?",
    placeholder: "Mobile telephone preferred if available",
    Icon: FaPhone,
  },
  {
    name: "Email",
    type: "email",
    label: "What is the email address at this location?",
    placeholder:
      "Our service procedures & registers will be sent to this address",
    Icon: FaEnvelope,
  },
  {
    name: "Accounts",
    type: "email",
    label: "Email address to send accounts?",
    placeholder:
      "Our invoice will be sent to this email address for this location.",
    Icon: FaEnvelope,
  },
];

export const SHARED_RISK_FIELDS: FieldConfig[] = [
  {
    name: "Amount",
    type: "select",
    label:
      "What is the average amount of cash that we might be expected to collect or deliver at this location?",
    Icon: FaMoneyBillAlt,
    options: [
      { value: "", label: "Select Amount:" },
      { value: "$100 to $500", label: "$100 to $500" },
      { value: "$500 to $1,000", label: "$500 to $1,000" },
      { value: "$1,000 to 5,000", label: "$1,000 to 5,000" },
      { value: "$5,000 to $10,000", label: "$5,000 to $10,000" },
      { value: "$10,000 to $20,000", label: "$10,000 to $20,000" },
      { value: "$20,000 to $25,000", label: "$20,000 to $25,000" },
      { value: "$25,000 to $50,000", label: "$25,000 to $50,000" },
      { value: "$50,000 to $100,000", label: "$50,000 to $100,000" },
      { value: "$100,000+", label: "$100,000 Plus" },
    ],
    footnote:
      "E.g., If the collection is around $6,000, the average collection amount would be $5,000 to $10,000.",
  },
  {
    name: "Parking",
    type: "checkbox-group",
    variant: "grid",
    label: "What are the parking recommendations for location?",
    options: [
      {
        value: "* There is on street parking available.",
        label: "There is on street parking available.",
      },
      {
        value: "* You will need to pay for parking.",
        label: "You will need to pay for parking.",
      },
      {
        value: "* There are loading zones on the street.",
        label: "There are loading zones on the street.",
      },
      {
        value: "* There is off street parking available.",
        label: "There is off street parking available.",
      },
      {
        value: "* You are able to park onsite.",
        label: "You are able to park onsite.",
      },
    ],
    footnote: "Please tick what is applicable at this location.",
  },
  {
    name: "Security",
    type: "checkbox-group",
    variant: "grid",
    label: "Are any of these security features at this location?",
    options: [
      {
        value: "* We have a dedicated cash office.",
        label: "We have a dedicated cash office.",
      },
      {
        value: "* We have an enclosed room.",
        label: "We have an enclosed room.",
      },
      {
        value: "* We have a hold up alarm.",
        label: "We have a hold up alarm.",
      },
      {
        value: "* There are CCTV cameras onsite.",
        label: "There are CCTV cameras onsite.",
      },
      {
        value: "* We have security guards onsite.",
        label: "We have security guards onsite.",
      },
      {
        value: "* We have reliable staff backup onsite.",
        label: "We have reliable staff backup onsite.",
      },
      {
        value: "* We use door intercoms to let people in.",
        label: "We use door intercoms to let people in.",
      },
      {
        value: "* We have swipe cards or pin codes on public entrances.",
        label: "We have swipe cards or pin codes on public entrances.",
      },
    ],
    footnote: "Please tick what is applicable at this location.",
  },
  {
    name: "External",
    type: "checkbox-group",
    variant: "grid",
    label: "What potential EXTERNAL hazards are at this location?",
    options: [
      {
        value: "* There are areas that an offender could hide.",
        label: "There are areas that an offender could hide.",
      },
      {
        value: "* There is poor lighting at this site.",
        label: "There is poor lighting at this site.",
      },
      {
        value: "* The public has free access to this site.",
        label: "The public has free access to this site.",
      },
      {
        value: "* You will have to wait to be let in.",
        label: "You will have to wait to be let in.",
      },
      {
        value: "* There are obstacles like plant or machinery at this site.",
        label: "There are obstacles like plant or machinery at this site.",
      },
      {
        value: "* You will have to walk through via a car park.",
        label: "You will have to walk through via a car park.",
      },
      {
        value: "* There are hazards on the approach route.",
        label: "There are hazards on the approach route.",
      },
      {
        value: "* The entrance to the site is not easily visible.",
        label: "The entrance to the site is not easily visible.",
      },
    ],
    footnote: "Please tick what is applicable at this location.",
  },
  {
    name: "Internal",
    type: "checkbox-group",
    variant: "grid",
    label: "What potential INTERNAL hazards are at this location?",
    options: [
      {
        value: "* You will have to wait to be let into the room.",
        label: "You will have to wait to be let into the room.",
      },
      {
        value: "* There are fire doors onsite.",
        label: "There are fire doors onsite.",
      },
      {
        value: "* You will have to go up/down a lift.",
        label: "You will have to go up/down a lift.",
      },
      {
        value: "* You will have to go up/down flights of stairs.",
        label: "You will have to go up/down flights of stairs.",
      },
      {
        value: "* You will have to go up/down escalators.",
        label: "You will have to go up/down escalators.",
      },
      {
        value: "* There are areas where an offender could hide.",
        label: "There are areas where an offender could hide.",
      },
      {
        value: "* You will have to go through doorways.",
        label: "You will have to go through doorways.",
      },
      { value: "* There are steps.", label: "There are steps." },
      { value: "* There are passageways.", label: "There are passageways." },
      {
        value: "* There are slippery floors.",
        label: "There are slippery floors.",
      },
      {
        value: "* There are obstacles like stock or merchandise.",
        label: "There are obstacles like stock or merchandise.",
      },
    ],
    footnote: "Please tick what is applicable at this location.",
  },
];
