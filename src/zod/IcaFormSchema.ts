import { z } from "zod";
import {
  ACCEPTED_FILE_TYPES,
  CommonValidations,
  createFileValidation,
} from "./validationHelpers";

export const IcaFormSchema = z.object({
  Name: CommonValidations.fullName(),

  OrganisationType: CommonValidations.selectRequired("Organisation type"),

  ABN: CommonValidations.abn(),

  Phone: CommonValidations.phone(10, 15),

  Email: CommonValidations.email("Email address"),

  Address: CommonValidations.address(10),

  AddressPostal: CommonValidations.address(10),

  DateCommencement: z
    .date({
      required_error: "Agreement commencement date is required.",
      invalid_type_error: "Please enter a valid date.",
    })
    .optional()
    .refine(
      (date) => date !== undefined,
      "Agreement commencement date is required.",
    )
    .refine((date) => {
      if (date === undefined) return true;
      return date <= new Date();
    }, "Commencement date must be in the past or today."),

  AcceptAgreement: z
    .array(z.string())
    .min(1, "You must accept the agreement terms to continue."),

  DateDeed: z
    .date({
      required_error: "Date of deed is required.",
      invalid_type_error: "Please enter a valid date.",
    })
    .optional()
    .refine((date) => date !== undefined, "Date of deed is required.")
    .refine((date) => {
      if (date === undefined) return true;
      return date <= new Date();
    }, "Date of deed must be in the past or today."),

  NameConfirm: CommonValidations.fullName(),

  AddressResidential: CommonValidations.address(10),

  GovernmentID: createFileValidation(
    "Government ID",
    ACCEPTED_FILE_TYPES.documents,
  )
    .optional()
    .refine((file) => file !== undefined, "Please upload your Government ID."),

  BusinessName: z
    .string()
    .min(2, "Business/company name is required.")
    .max(200, "Business/company name must be less than 200 characters."),

  WitnessName: CommonValidations.fullName(),

  WitnessAddress: CommonValidations.address(10),

  WitnessID: createFileValidation("Witness ID", ACCEPTED_FILE_TYPES.images)
    .optional()
    .refine((file) => file !== undefined, "Please upload the Witness ID."),

  SecurityLicense: createFileValidation(
    "Security license",
    ACCEPTED_FILE_TYPES.documents,
  )
    .optional()
    .refine(
      (file) => file !== undefined,
      "Please upload your Security or Masters License.",
    ),

  CITInsurance: createFileValidation(
    "Cash in transit insurance",
    ACCEPTED_FILE_TYPES.documents,
  )
    .optional()
    .refine((file) => file !== undefined, "Please upload your CIT Insurance."),

  eDocketsContractorCode: z
    .string()
    .min(1, "eDockets contractor code is required.")
    .max(50, "eDockets contractor code is too long.")
    .refine(
      (value) => value.trim().length > 0,
      "eDockets contractor code cannot be empty.",
    ),
});

export type IcaFormData = z.infer<typeof IcaFormSchema>;
export type IcaFormInput = z.input<typeof IcaFormSchema>;

export const ICA_DEFAULT_VALUES: IcaFormInput = {
  Name: "",
  OrganisationType: "",
  ABN: "",
  Phone: "",
  Email: "",
  Address: "",
  AddressPostal: "",
  DateCommencement: undefined,
  AcceptAgreement: [],
  DateDeed: undefined,
  NameConfirm: "",
  AddressResidential: "",
  GovernmentID: undefined,
  BusinessName: "",
  WitnessName: "",
  WitnessAddress: "",
  WitnessID: undefined,
  SecurityLicense: undefined,
  CITInsurance: undefined,
  eDocketsContractorCode: "",
};

export const ICA_FIELD_PRIORITY: Array<keyof IcaFormData> = [
  "Name",
  "OrganisationType",
  "ABN",
  "Phone",
  "Email",
  "Address",
  "AddressPostal",
  "DateCommencement",
  "AcceptAgreement",
  "DateDeed",
  "NameConfirm",
  "AddressResidential",
  "GovernmentID",
  "BusinessName",
  "WitnessName",
  "WitnessAddress",
  "WitnessID",
  "SecurityLicense",
  "CITInsurance",
  "eDocketsContractorCode",
];
