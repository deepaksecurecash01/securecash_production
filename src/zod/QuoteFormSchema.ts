import { z } from "zod";
import { CommonValidations } from "./validationHelpers";

const ServiceType = z.enum(["Banking", "Change"]);

 const QuoteFormSchema = z.object({
  FullName: CommonValidations.fullName(),
  Organisation: z.string().min(1, "Please enter your organisation's name."),
  Phone: CommonValidations.phone(8, 15),
  Referrer: z.string().min(1, "Please enter where you heard about us."),
  Email: CommonValidations.email("Email address"),
  Address: CommonValidations.address(5),
  Locations: z.string().min(1, "Please enter locations for the service."),
  Service: z.array(ServiceType).min(1, "Please select at least one service."),

  BankingFrequency: z.string().optional(),
  BankingAmount: z.string().optional(),
  BankingBank: z.string().optional(),
  BankingDays: z.array(z.string()).optional(),
  BankingComments: z.string().optional(),
  ChangeFrequency: z.string().optional(),
  ChangeNotesAmount: z.string().optional(),
  ChangeCoinsAmount: z.string().optional(),
  ChangeDays: z.array(z.string()).optional(),
  ChangeComments: z.string().optional(),
  BotField: CommonValidations.botField(),
});

 const BankingSchema = z
  .object({
    BankingFrequency: z.enum(
      ["Weekly", "Fortnightly", "Ad Hoc", "Special Event (once off)"],
      {
        errorMap: () => ({ message: "Please select a collection frequency." }),
      },
    ),

    BankingAmount: z.enum(
      [
        "$0 - $5000",
        "$5000 - $20,000",
        "$20,000 - $40,000",
        "$40,000 - $50,000",
        "over $50,000",
      ],
      {
        errorMap: () => ({
          message: "Please select an average collection amount.",
        }),
      },
    ),

    BankingBank: z.string().min(1, "Please enter who you bank with."),

    BankingDays: z
      .array(
        z.enum([
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
          "Ad Hoc",
        ]),
      )
      .min(1, "Please select at least one day for collection."),

    BankingComments: z.string().optional(),
  })
  .passthrough();

 const ChangeSchema = z
  .object({
    ChangeFrequency: z.enum(
      ["Weekly", "Fortnightly", "Ad Hoc", "Special Event (once off)"],
      {
        errorMap: () => ({ message: "Please select a frequency for change." }),
      },
    ),

    ChangeNotesAmount: z.enum(
      [
        "$0 - $1000",
        "$1000 - $5000",
        "$5000 - $20,000",
        "$20,000 - $50,000",
        "over $50,000",
      ],
      {
        errorMap: () => ({ message: "Please select an average notes value." }),
      },
    ),

    ChangeCoinsAmount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid amount for coins.")
      .min(1, "Please enter the average coins value."),

    ChangeDays: z
      .array(
        z.enum([
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
          "Ad Hoc",
          "Banking",
        ]),
      )
      .min(1, "Please select at least one usual day for delivery."),

    ChangeComments: z.string().optional(),
  })
  .passthrough();

export type QuoteFormData = z.infer<typeof QuoteFormSchema>;
export type QuoteFormInput = z.input<typeof QuoteFormSchema>;
export type BankingFormData = z.infer<typeof BankingSchema>;
export type ChangeFormData = z.infer<typeof ChangeSchema>;

export const QUOTE_SCHEMAS = {
  quote: QuoteFormSchema,
  banking: BankingSchema,
  change: ChangeSchema,
};

export const QUOTE_DEFAULT_VALUES: QuoteFormInput = {
  FullName: "",
  Organisation: "",
  Phone: "",
  Referrer: "",
  Email: "",
  Address: "",
  Locations: "",
  Service: [],
  BankingFrequency: "",
  BankingAmount: "",
  BankingBank: "",
  BankingDays: [],
  BankingComments: "",
  ChangeFrequency: "",
  ChangeNotesAmount: "",
  ChangeCoinsAmount: "",
  ChangeDays: [],
  ChangeComments: "",
  BotField: "",
};

export const QUOTE_FIELD_PRIORITY: Array<keyof QuoteFormData> = [
  "FullName",
  "Organisation",
  "Phone",
  "Referrer",
  "Email",
  "Address",
  "Locations",
  "Service",
];
