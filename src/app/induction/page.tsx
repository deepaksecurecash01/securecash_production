"use client";
import UniversalFormField from "@/components/form/UniversalFormField";
import { useFocusManager } from "@/hooks/useFocusManager";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaLock, FaUser } from "react-icons/fa";
import { z } from "zod";
import { useInduction } from "./context/InductionContext";

const LoginFormSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(4, "Password must be at least 4 characters"),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;

export default function InductionLoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useInduction();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
  });

  const focus = useFocusManager(control);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/induction/lessons");
    } else {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, router]);

  const handleFieldFocus = useCallback(
    (fieldName: string) => {
      focus.setFocusField(fieldName as any);
    },
    [focus],
  );

  const handleFieldBlur = useCallback(() => {
    focus.clearFocus();
  }, [focus]);

  const handleValidationError = useCallback(
    (validationErrors: Record<string, unknown>) => {
      focus.focusFirstError(validationErrors);
    },
    [focus],
  );

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setLoginError(null);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const result = await login(data.username, data.password);

    if (result.success) {
      router.push("/induction/lessons");
    } else {
      setLoginError(result.error ?? "Invalid credentials. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = rhfHandleSubmit(onSubmit, (validationErrors) => {
    handleValidationError(validationErrors);
  });

  if (isCheckingAuth) {
    return (
      <div className="min-h-[80vh] bg-[#f2f2f2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-[#f2f2f2] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg max-w-md w-full shadow-2xl">
        <div className="flex flex-col justify-center items-center">
          <Image
            src="/images/SecureCash.webp"
            alt="SecureCash Logo"
            width={285}
            height={91}
            sizes="285px"
            className="w-[285px] h-auto"
            priority
          />
          <hr
            className="w-[100px] mt-3 mb-6 h-[4px] rounded-[5px] border-0 mx-auto bg-primary"
            aria-hidden="true"
          />
        </div>

        <div className="text-center mb-6">
          <p className="text-[20px] text-gray-600 font-semibold">
            Banking Courier Induction
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative" noValidate>
          <div className="relative">
            <UniversalFormField
              name="username"
              control={control}
              type="text"
              theme="light"
              placeholder="Enter username"
              Icon={FaUser}
              label="Username"
              currentFocusField={focus.currentFocusField}
              onFieldFocus={handleFieldFocus}
              onFieldBlur={handleFieldBlur}
              autoComplete="username"
            />
          </div>

          <div className="relative">
            <UniversalFormField
              name="password"
              control={control}
              type="password"
              theme="light"
              placeholder="Enter password"
              Icon={FaLock}
              label="Password"
              currentFocusField={focus.currentFocusField}
              onFieldFocus={handleFieldFocus}
              onFieldBlur={handleFieldBlur}
              autoComplete="current-password"
            />
          </div>

          <div className="mx-auto relative">
            {loginError && (
              <div className="absolute bg-red-50 border border-red-200 text-red-600 px-4 py-1 rounded text-sm w-full -top-1.5">
                {loginError}
              </div>
            )}
            <div className="button-section relative pt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-[#c6a54b] text-white rounded hover:bg-[#b09140] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            This is a secure training portal. Access credentials are provided by
            SecureCash management.
          </p>
        </div>
      </div>
    </div>
  );
}
