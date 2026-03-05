import { z } from "zod";
import { CommonValidations } from "./validationHelpers";

// ─── Base Schema ──────────────────────────────────────────────────────────────

const BaseContactFormSchema = z.object({
  // z.string().min(1) — matches original. Empty string passes base validation
  // so superRefine always runs. The valid department values are enforced in
  // superRefine below, keeping the type as plain `string` so "" is compatible
  // with useFormManager's DeepPartial<TFormData> typing.
  Department: z.string().min(1, "Please select a department."),

  FullName: CommonValidations.fullName(),
  Organisation: z.string().min(1, "Please enter your organisation's name."),
  Phone: CommonValidations.phone(8, 15),
  Email: CommonValidations.email("Email address"),

  // .default([]) ensures ChkCallBack is always [] inside superRefine —
  // never undefined — even if RHF omits the field from the payload.
  ChkCallBack: z.array(z.string()).default([]),

  // .optional() so type is Date | undefined — matches useFormManager's
  // DeepPartial typing. superRefine enforces required-when-checked.
  CallbackDate: z.date().optional(),
  CallbackTime: z.string().optional(),
  CallbackState: z.string().optional(),

  Message: z
    .string()
    .min(10, "Please provide more detail (minimum 10 characters)."),

  BotField: CommonValidations.botField(),
});

// ─── Schema ───────────────────────────────────────────────────────────────────

const VALID_DEPARTMENTS = ["customers", "sales", "operations"] as const;

export const ContactFormSchema = BaseContactFormSchema.superRefine(
  (data, ctx) => {
    // Enforce valid department value on submission
    if (
      !VALID_DEPARTMENTS.includes(
        data.Department as (typeof VALID_DEPARTMENTS)[number],
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["Department"],
        message: "Please select a department.",
      });
    }

    // Callback conditional validation
    const callbackRequested = (data.ChkCallBack ?? []).length > 0;
    if (!callbackRequested) return;

    if (!data.CallbackDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CallbackDate"],
        message: "Please select a callback date.",
      });
    }

    if (!data.CallbackTime || data.CallbackTime === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CallbackTime"],
        message: "Please select a callback time.",
      });
    }

    if (!data.CallbackState || data.CallbackState === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CallbackState"],
        message: "Please select your state.",
      });
    }

    if (data.CallbackDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(data.CallbackDate);
      selected.setHours(0, 0, 0, 0);
      if (selected < today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["CallbackDate"],
          message: "Please select a future date for your callback.",
        });
      }
    }
  },
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContactFormData = z.infer<typeof BaseContactFormSchema>;
export type ContactFormInput = z.input<typeof BaseContactFormSchema>;

// ─── Default Values ───────────────────────────────────────────────────────────

export const CONTACT_DEFAULT_VALUES: ContactFormInput = {
  Department: "",
  FullName: "",
  Organisation: "",
  Phone: "",
  Email: "",
  ChkCallBack: [],
  CallbackDate: undefined,
  CallbackTime: "",
  CallbackState: "",
  Message: "",
  BotField: "",
};

// ─── Field Priority ───────────────────────────────────────────────────────────

export const CONTACT_FIELD_PRIORITY: Array<keyof ContactFormData> = [
  "Department",
  "FullName",
  "Organisation",
  "Phone",
  "Email",
  "ChkCallBack",
  "CallbackDate",
  "CallbackTime",
  "CallbackState",
  "Message",
];
