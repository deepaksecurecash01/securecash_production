import { z } from "zod";

// ─── SCHEMA ───────────────────────────────────────────────────────────────────

export const LoginFormSchema = z.object({
  // Single .min() — .min(3) already blocks empty strings, .min(1) is redundant.
  username: z.string().min(3, "Username must be at least 3 characters."),

  password: z.string().min(4, "Password must be at least 4 characters."),
});

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type LoginFormData = z.infer<typeof LoginFormSchema>;
export type LoginFormInput = z.input<typeof LoginFormSchema>;

// ─── DEFAULT VALUES ───────────────────────────────────────────────────────────

export const LOGIN_DEFAULT_VALUES: LoginFormInput = {
  username: "",
  password: "",
};
