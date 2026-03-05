import { z } from "zod";
import { CommonValidations } from "./validationHelpers";

export const ORGANISATION_TYPES = [
  "Individual (Sole Trader)",
  "Trustees & Beneficiaries",
  "Domestic Pty Ltd or Ltd Company",
  "Registered Foreign Company",
  "Foreign Company Not Registered in Australia",
  "Partners & Partnerships",
  "Associations",
  "Registered Co-Operatives",
  "Government Body",
  "School or Education Institute",
  "Church or Religious Organisation",
] as const;

export type OrganisationType = (typeof ORGANISATION_TYPES)[number];


export const AustracFormSchema = z.object({
  Organisation: z
    .string()
    .min(2, "Organisation name must be at least 2 characters long.")
    .max(200, "Organisation name is too long (maximum 200 characters).")
    .refine(
      (org) => /[A-Za-z]/.test(org.trim()),
      "Organisation name must contain at least one letter.",
    ),

  ABN: CommonValidations.abn(),

 
  Website: z
    .string()
    .optional()
    .refine((url) => {
      if (!url || url.trim() === "") return true;
      return /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(url);
    }, "Please enter a valid website URL (e.g. https://example.com)."),

  OrganisationEmail: CommonValidations.email("Organisation email"),

  OrganisationType: z.enum(ORGANISATION_TYPES, {
    errorMap: () => ({ message: "Please select a valid organisation type." }),
  }),

  Address: CommonValidations.address(10),

  State: CommonValidations.australianState(),

  Personnel: z
    .string()
    .min(
      10,
      "Please provide more detailed personnel information (minimum 10 characters).",
    )
    .max(2000, "Personnel information is too long (maximum 2000 characters).")
    .refine(
      (personnel) => /[A-Za-z]{2,}/.test(personnel.trim()),
      "Please provide valid personnel names and positions.",
    ),

  BotField: CommonValidations.botField(),
});


export type AustracFormData = z.infer<typeof AustracFormSchema>;
export type AustracFormInput = z.input<typeof AustracFormSchema>;

export const AUSTRAC_DEFAULT_VALUES : AustracFormInput = {
  Organisation: "",
  ABN: "",
  Website: "",
  OrganisationEmail: "",
  OrganisationType: "" as AustracFormData["OrganisationType"],
  Address: "",
  State: "" ,
  Personnel: "",
  BotField: "",
}

export const AUSTRAC_FIELD_PRIORITY: Array<keyof AustracFormData> = [
  "Organisation",
  "ABN",
  "Website",
  "OrganisationEmail",
  "OrganisationType",
  "Address",
  "State",
  "Personnel",
];
