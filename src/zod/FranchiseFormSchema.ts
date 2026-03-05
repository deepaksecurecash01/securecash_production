import { z } from "zod";
import { CommonValidations } from "./validationHelpers";

export const FranchiseFormSchema = z
  .object({
    FullName: CommonValidations.fullName(),

    Phone: CommonValidations.phone(8, 15),

    Email: CommonValidations.email("Email address"),

    Address: CommonValidations.address(5),

    InterestedArea: z
      .string()
      .min(2, "Please specify the area of interest (minimum 2 characters).")
      .max(100, "Area of interest is too long (maximum 100 characters).")
      .refine(
        (area) => /[A-Za-z]/.test(area.trim()),
        "Please enter a valid territory, area, or suburb name.",
      ),

    ReasonForInterest: z
      .string()
      .min(
        10,
        "Please provide more detail about your interest (minimum 10 characters).",
      )
      .max(1000, "Response is too long (maximum 1000 characters)."),

    ReferralSource: z
      .string()
      .min(1, "Please tell us where you heard about this opportunity."),

    ReferralSourceOther: z.string().optional(),

    BotField: CommonValidations.botField(),
  })
  .refine(
    (data) => {
      if (data.ReferralSource !== "Other") return true;
      return (
        !!data.ReferralSourceOther && data.ReferralSourceOther.trim().length > 0
      );
    },
    {
      message: "Please specify where you heard about us.",
      path: ["ReferralSourceOther"],
    },
  );

export type FranchiseFormData = z.infer<typeof FranchiseFormSchema>;
export type FranchiseFormInput = z.input<typeof FranchiseFormSchema>;

export const FRANCHISE_DEFAULT_VALUES: FranchiseFormInput = {
  FullName: "",
  Phone: "",
  Email: "",
  Address: "",
  InterestedArea: "",
  ReasonForInterest: "",
  ReferralSource: "",
  ReferralSourceOther: "",
  BotField: "",
};

export const FRANCHISE_FIELD_PRIORITY: Array<keyof FranchiseFormData> = [
  "FullName",
  "Phone",
  "Email",
  "Address",
  "InterestedArea",
  "ReasonForInterest",
  "ReferralSource",
  "ReferralSourceOther",
];
