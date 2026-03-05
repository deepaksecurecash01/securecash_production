"use client";
import UniversalFormField from "@/components/form/UniversalFormField";
import { useInduction } from "@/context/InductionContext";
import { useFormManager } from "@/hooks/useFormManager";
import {
  LOGIN_DEFAULT_VALUES,
  LoginFormData,
  LoginFormSchema,
} from "@/zod/LoginFormSchema";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaLock, FaUser } from "react-icons/fa";

export default function InductionLoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useInduction();
  const [loginError, setLoginError] = useState<string | null>(null);

  // isAuthenticated is resolved synchronously in InductionContext via
  // getInitialAuth() — no async check needed, no loading spinner required.
  if (isAuthenticated) {
    router.push("/induction/lessons");
    return null;
  }

  const formManager = useFormManager({
    schema: LoginFormSchema,
    defaultValues: LOGIN_DEFAULT_VALUES,
    theme: "light",
    formType: "login",
    formId: "InductionLogin",
    onSuccess: () => {},
    onError: (error: unknown) => console.error("Login error", error),
    prepareData: async (data: LoginFormData) => {
      setLoginError(null);
      const success = login(data.username, data.password);

      if (success) {
        router.push("/induction/lessons");
      } else {
        setLoginError("Invalid credentials. Please try again.");
        // Throw to prevent isSubmitted from being set
        throw new Error("Invalid credentials");
      }

      return data;
    },
  });

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
            priority={true}
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

        <form
          onSubmit={formManager.handleSubmit}
          className="space-y-4 relative"
          noValidate
        >
          <UniversalFormField
            {...formManager.getFieldProps({
              name: "username",
              type: "text",
              label: "Username",
              placeholder: "Enter username",
              Icon: FaUser,
            })}
            theme="light"
            autoComplete="username"
          />

          <UniversalFormField
            {...formManager.getFieldProps({
              name: "password",
              type: "password",
              label: "Password",
              placeholder: "Enter password",
              Icon: FaLock,
            })}
            theme="light"
            autoComplete="current-password"
          />

          <div className="mx-auto relative">
            {loginError && (
              <div className="absolute bg-red-50 border border-red-200 text-red-600 px-4 py-1 rounded text-sm w-full -top-1.5">
                {loginError}
              </div>
            )}
            <div className="button-section relative pt-8">
              <button
                type="submit"
                disabled={formManager.isSubmitting}
                className="w-full px-6 py-3 bg-[#c6a54b] text-white rounded hover:bg-[#b09140] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {formManager.isSubmitting ? "Signing in..." : "Sign In"}
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
