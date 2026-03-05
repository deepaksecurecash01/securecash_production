import { z } from "zod";

export const FILE_SIZE_LIMIT = 10 * 1024 * 1024;

export const ACCEPTED_FILE_TYPES = {
  images: ["image/jpeg", "image/jpg", "image/png"],
  documents: ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
} as const;

export type AcceptedFileTypes =
  (typeof ACCEPTED_FILE_TYPES)[keyof typeof ACCEPTED_FILE_TYPES];

export const ValidationHelpers = {
  abnFormat: (abn: string): string => {
    const digits = abn.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 8)
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`;
  },

  cleanABN: (abn: string): string => abn.replace(/\s/g, ""),
  cleanPhone: (phone: string): string => phone.replace(/[^0-9]/g, ""),

  isPastDate: (date: Date): boolean => date <= new Date(),

  isMinAge: (date: Date, minAge: number): boolean => {
    const minAgeDate = new Date();
    minAgeDate.setFullYear(minAgeDate.getFullYear() - minAge);
    return date <= minAgeDate;
  },

  isValidDateRange: (
    date: Date,
    minYears: number,
    maxYears: number,
  ): boolean => {
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - maxYears);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - minYears);
    return date >= minDate && date <= maxDate;
  },

  isValidFileType: (file: unknown, acceptedTypes: string[]): boolean =>
    file instanceof File && acceptedTypes.includes(file.type),
};

const isBrowser = typeof window !== "undefined";

export const createFileValidation = (
  fieldName: string,
  acceptedTypes: readonly string[] = ACCEPTED_FILE_TYPES.images,
): z.ZodType<File> =>
  z
    .custom<File>(
      (val) => !isBrowser || val instanceof File,
      `Please upload a valid ${fieldName.toLowerCase()} file.`,
    )
    .refine(
      (file) => !isBrowser || file.size <= FILE_SIZE_LIMIT,
      `File size must be less than ${FILE_SIZE_LIMIT / (1024 * 1024)}MB.`,
    )
    .refine(
      (file) => !isBrowser || acceptedTypes.includes(file.type),
      `Only ${acceptedTypes.includes("application/pdf") ? "image files or PDF" : "image files"} are allowed for ${fieldName.toLowerCase()}.`,
    ) as z.ZodType<File>;

const AUSTRALIAN_STATES = [
  "NSW",
  "VIC",
  "QLD",
  "WA",
  "SA",
  "TAS",
  "ACT",
  "NT",
  "NZ",
] as const;

const INVALID_FULL_NAMES = [
  "test test",
  "john doe",
  "jane doe",
  "example name",
] as const;

export const CommonValidations = {
  fullName: () =>
    z
      .string()
      .min(1, "Full name is required.")
      .max(100, "Full name is too long (maximum 100 characters).")
      .refine(
        (name) => /^[A-Za-z\s]+$/.test(name.trim()),
        "Name must only contain letters and spaces.",
      )
      .refine(
        (name) => name.trim().split(/\s+/).filter(Boolean).length >= 2,
        "Please enter your full name (first and last name).",
      )
      .refine(
        (name) =>
          !INVALID_FULL_NAMES.includes(
            name.trim().toLowerCase() as (typeof INVALID_FULL_NAMES)[number],
          ),
        "Please enter a valid full name.",
      ),

  abn: () =>
    z
      .string()
      .min(1, "ABN number is required.")
      .regex(/^[0-9\s]+$/, "ABN must contain only digits and spaces.")
      .refine(
        (abn) => abn.replace(/\s/g, "").length === 11,
        "ABN must be exactly 11 digits.",
      ),

  email: (fieldName = "Email") =>
    z
      .string()
      .min(1, `${fieldName} is required.`)
      .email("Please enter a valid email address.")
      .max(254, "Email address is too long.")
      .refine(
        (email) => !email.includes(".."),
        "Email address format is invalid (consecutive dots not allowed).",
      ),

  businessEmail: (fieldName = "Organisation email") =>
    z
      .string()
      .min(1, `${fieldName} is required.`)
      .email("Please enter a valid email address.")
      .max(254, "Email address is too long.")
      .refine((email) => {
        const personalDomains = [
          "gmail.com",
          "yahoo.com",
          "hotmail.com",
          "outlook.com",
          "live.com",
        ];
        const domain = email.toLowerCase().split("@")[1];
        return domain ? !personalDomains.includes(domain) : false;
      }, "Please use a business email address rather than personal email.")
      .refine(
        (email) => !email.includes(".."),
        "Email address format is invalid (consecutive dots not allowed).",
      ),

  phone: (minDigits = 8, maxDigits = 15) =>
    z
      .string()
      .min(1, "Phone number is required.")
      .max(20, "Phone number is too long.")
      .refine((phone) => {
        const clean = phone.replace(/[^0-9]/g, "");
        return clean.length >= minDigits && clean.length <= maxDigits;
      }, `Phone number must be between ${minDigits}-${maxDigits} digits.`),

  address: (minLength = 5) =>
    z
      .string()
      .min(1, "Address is required.")
      .min(minLength, `Address must be at least ${minLength} characters long.`)
      .max(500, "Address is too long (maximum 500 characters).")
      .refine(
        (address) =>
          /[A-Za-z]/.test(address) &&
          (/[0-9]/.test(address) ||
            /street|road|avenue|lane|drive|place|court|way/i.test(address)),
        "Please enter a valid address with street details.",
      ),

  australianState: () =>
    z
      .string()
      .min(1, "Please select a state or territory.")
      .refine(
        (state) => (AUSTRALIAN_STATES as readonly string[]).includes(state),
        "Please select a valid state or territory.",
      ),

  birthdate: (minAge = 13, maxAge = 150) =>
    z
      .date({
        required_error: "Date of Birth is required.",
        invalid_type_error: "Please enter a valid date.",
      })
      .refine(
        (date) => date <= new Date(),
        "Date of Birth must be in the past or today.",
      )
      .refine(
        (date) => ValidationHelpers.isMinAge(date, minAge),
        `You must be at least ${minAge} years old.`,
      )
      .refine(
        (date) => ValidationHelpers.isValidDateRange(date, minAge, maxAge),
        "Please enter a valid birth date.",
      ),

  botField: () => z.string().max(0, "Bot detected!"),

  selectRequired: (fieldName = "This field") =>
    z
      .string()
      .min(1, `${fieldName} is required.`)
      .refine(
        (value) => value !== "" && value !== "select" && value !== "default",
        `Please select a valid ${fieldName.toLowerCase()}.`,
      ),
};
