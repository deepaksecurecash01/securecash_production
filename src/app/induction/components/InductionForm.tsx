"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaLock,
  FaInfoCircle,
  FaCheckCircle,
  FaSpinner,
  FaTimesCircle,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  InductionFormSchema,
  INDUCTION_DEFAULT_VALUES,
  type InductionFormData,
} from "@/zod/InductionFormSchema";
import UniversalFormField from "@/components/form/UniversalFormField";
import {
  checkUsernameAvailability,
  cancelUsernameCheck,
  validateUsernameFormat,
} from "@/utils/usernameValidation";
import IcaContractorClauses from "@/app/ica/form/IcaAgreementClauses";
import { useFormManager } from "@/hooks/useFormManager";
import { INDUCTION_AGREEMENT_DATA } from "@/data/induction-agreement";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InductionFormManager = ReturnType<
  typeof useFormManager<InductionFormData>
>;

// "warning" = API check failed — submission is still permitted (fail-open).
interface UsernameStatus {
  checking: boolean;
  available: boolean | null | "warning";
  message: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Please Select" },
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
  { value: "NZ", label: "New Zealand" },
];

const FILE_UPLOAD_CONFIG = {
  enabled: true,
  fields: [
    { field: "Photo", prefix: "Personal Photo" },
    { field: "DriversLicense", prefix: "Drivers License" },
  ],
  compression: {
    targetSizeKB: 400,
    maxSizeMB: 5,
    allowedTypes: ["image/jpeg", "image/png", "image/jpg"],
  },
  concurrencyLimit: 2,
};

// ─── Component ────────────────────────────────────────────────────────────────

const InductionForm = () => {
  const router = useRouter();

  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>({
    checking: false,
    available: null,
    message: "",
  });

  const formManager = useFormManager({
    schema: InductionFormSchema,
    defaultValues: INDUCTION_DEFAULT_VALUES,
    formType: "induction",
    formId: "INDUCTION",
    theme: "ica",
    fileUpload: FILE_UPLOAD_CONFIG,
    onSuccess: () => {
      // Redirect to completion page with ?submitted=true so CompletionPage
      // knows to clear the session. The flag prevents accidental clearing
      // when navigating directly to /induction/complete.
      setTimeout(() => {
        router.push("/induction/complete?submitted=true");
      }, 2000);
    },
    onError: () => {},
    prepareData: async (data: InductionFormData) => ({
      ...data,
      formType: "induction",
    }),
  });

  const usernameValue = formManager.watch("EdocketUsername");

  // Cancel pending debounced check on unmount.
  useEffect(() => () => cancelUsernameCheck(), []);

  const handleUsernameChange = useCallback(async (value: string) => {
    setUsernameStatus({ checking: false, available: null, message: "" });

    if (!value) return;

    const formatCheck = validateUsernameFormat(value);
    if (!formatCheck.valid) {
      setUsernameStatus({ checking: false, available: false, message: formatCheck.message });
      return;
    }

    if (value.length < 4) {
      setUsernameStatus({ checking: false, available: false, message: "" });
      return;
    }

    setUsernameStatus({ checking: true, available: null, message: "" });

    try {
      const result = await checkUsernameAvailability(value);

      if (result.tooShort) {
        setUsernameStatus({ checking: false, available: null, message: "" });
        return;
      }

      if (result.error) {
        setUsernameStatus({
          checking: false,
          available: "warning",
          message:
            "Unable to verify username availability. After your submission it'll be validated by our system and you'll be informed via email.",
        });
        return;
      }

      if (result.available) {
        setUsernameStatus({ checking: false, available: true, message: "Username is available" });
      } else {
        setUsernameStatus({ checking: false, available: false, message: "This username is already taken" });
      }
    } catch {
      setUsernameStatus({
        checking: false,
        available: "warning",
        message:
          "Unable to verify username availability. After your submission it'll be validated by our system and you'll be informed via email.",
      });
    }
  }, []);

  useEffect(() => {
    if (usernameValue !== undefined) {
      handleUsernameChange(usernameValue);
    }
  }, [usernameValue, handleUsernameChange]);

  // Memoized — only recomputes when the relevant values actually change.
  const canSubmit = useMemo(() => {
    const username = usernameValue ?? "";
    if (usernameStatus.checking) return false;
    if (usernameStatus.available === false) return false;
    if (username.length > 0 && username.length < 4) return false;
    if (username.length >= 4 && usernameStatus.available === null) return false;
    if (formManager.isSubmitting) return false;
    return true;
  }, [usernameStatus, usernameValue, formManager.isSubmitting]);

  return (
    <form
      onSubmit={formManager.handleSubmit}
      className="bg-white rounded-lg shadow-lg px-12 py-16 space-y-6"
      noValidate
      autoComplete="off"
    >
      {/* Header */}
      <div className="text-center border-b border-dark-border/30 pb-12">
        <h1 className="text-[34px] font-bold text-gray-800">
          Your Personal Particulars
        </h1>
        <hr className="mt-5 mb-5 w-[100px] h-[4px] rounded-[5px] border-0 mx-auto bg-primary" />
        <div className="bg-[rgb(242,242,242,0.9)] p-6 mt-6 rounded-lg text-center space-y-5">
          <p className="text-gray-700">
            Awesome, you've successfully completed the SecureCash induction!
            Please fill out the form below.
          </p>
        </div>
      </div>

      {/* SECTION 1: Name & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative flex flex-col h-full justify-between">
          <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
            What is your full name?
          </label>
          <UniversalFormField
            {...formManager.getFieldProps({
              name: "Name",
              type: "text",
              placeholder: "Your Full Name",
              Icon: FaUser,
            })}
            theme="ica"
          />
        </div>

        <div className="relative flex flex-col h-full justify-between">
          <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
            What is your best contact number?
          </label>
          <UniversalFormField
            {...formManager.getFieldProps({
              name: "Phone",
              type: "tel",
              placeholder: "Your Phone Number",
              Icon: FaPhone,
            })}
            theme="ica"
          />
        </div>
      </div>

      {/* SECTION 2: Email */}
      <div className="relative flex flex-col h-full justify-between">
        <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
          What is your email address?
        </label>
        <UniversalFormField
          {...formManager.getFieldProps({
            name: "Email",
            type: "email",
            placeholder: "Your Email Address",
            Icon: FaEnvelope,
          })}
          theme="ica"
        />
      </div>

      {/* SECTION 3: Address */}
      <div className="relative flex flex-col h-full justify-between">
        <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
          What is your physical address?
        </label>
        <UniversalFormField
          {...formManager.getFieldProps({
            name: "Address",
            type: "text",
            placeholder: "Your Physical Address",
            Icon: FaMapMarkerAlt,
          })}
          theme="ica"
        />
      </div>

      {/* SECTION 4: File Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative flex flex-col h-full justify-between">
          <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
            Clear, frontal photo of your upper body and face:
          </label>
          <UniversalFormField
            {...formManager.getFieldProps({
              name: "Photo",
              type: "file",
              accept: "image/*",
            })}
            fileUploadState={formManager.fileUpload}
            theme="ica"
          />
        </div>

        <div className="relative flex flex-col h-full justify-between">
          <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
            Drivers License:
          </label>
          <UniversalFormField
            {...formManager.getFieldProps({
              name: "DriversLicense",
              type: "file",
              accept: "image/*",
            })}
            fileUploadState={formManager.fileUpload}
            theme="ica"
          />
        </div>
      </div>

      {/* SECTION 5: Confidentiality Agreement */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 pt-4 mb-2 w-full text-left px-1 768px:px-0">
          Do you accept the following Confidentiality Agreement?
        </h4>
        {/* Agreement clauses from data file — not hardcoded here */}
        <IcaContractorClauses data={INDUCTION_AGREEMENT_DATA} />

        <div className="relative flex flex-col h-full justify-between">
          <UniversalFormField
            {...formManager.getFieldProps({
              name: "AcceptAgreement",
              type: "checkbox-group",
              variant: "agreement",
              options: [
                {
                  value: "accepted",
                  label: "I understand and accept the terms of this agreement.",
                },
              ],
            })}
            theme="ica"
          />
        </div>
      </div>

      {/* SECTION 6: State & Contractor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative flex flex-col h-full justify-between">
          <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
            What state will you be working in?
          </label>
          <UniversalFormField
            {...formManager.getFieldProps({
              name: "State",
              type: "select",
              options: STATE_OPTIONS,
              Icon: FaMapMarkerAlt,
            })}
            theme="ica"
          />
        </div>

        <div className="relative flex flex-col h-full justify-between">
          <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
            What contractor are you working for?
          </label>
          <UniversalFormField
            {...formManager.getFieldProps({
              name: "ContractorName",
              type: "text",
              placeholder: "Contractor Name",
              Icon: FaIdCard,
            })}
            theme="ica"
          />
        </div>
      </div>

      {/* SECTION 7: eDocket Credentials */}
      <div className="relative pt-4">
        <div className="bg-dark-border/90 p-4 rounded-lg">
          <p className="text-sm text-white">
            <FaInfoCircle className="inline mr-2" />
            In preparation for eDocket app release.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username with availability indicator */}
          <div className="relative flex flex-col h-full justify-between">
            <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
              Preferred eDocket Username:
            </label>
            <div className="relative pb-8">
              <UniversalFormField
                {...formManager.getFieldProps({
                  name: "EdocketUsername",
                  type: "text",
                  placeholder: "Choose a username",
                  Icon: FaUser,
                })}
                theme="ica"
              />

              {!formManager?.errors?.EdocketUsername &&
                usernameValue &&
                usernameValue.length >= 4 &&
                (usernameStatus.checking || usernameStatus.message) && (
                  <div
                    className={`absolute left-0 right-0 top-[calc(100%-2rem)] mt-1 flex items-start gap-2 text-sm transition-opacity duration-200 ${
                      usernameStatus.checking
                        ? "text-active-text"
                        : usernameStatus.available === true
                          ? "text-green-600"
                          : usernameStatus.available === "warning"
                            ? "text-yellow-600"
                            : "text-red-600"
                    }`}
                  >
                    {usernameStatus.checking && (
                      <>
                        <FaSpinner className="animate-spin mt-0.5 flex-shrink-0" />
                        <span>Checking availability...</span>
                      </>
                    )}
                    {usernameStatus.available === true && (
                      <>
                        <FaCheck className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{usernameStatus.message}</span>
                      </>
                    )}
                    {usernameStatus.available === "warning" && (
                      <>
                        <FaExclamationTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-left">{usernameStatus.message}</span>
                      </>
                    )}
                    {usernameStatus.available === false && (
                      <>
                        <FaTimesCircle className="text-red-600 mt-0.5 flex-shrink-0" />
                        <span>{usernameStatus.message}</span>
                      </>
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* Password */}
          <div className="relative">
            <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
              Preferred eDocket Password:
            </label>
            <UniversalFormField
              {...formManager.getFieldProps({
                name: "EdocketPassword",
                type: "password",
                placeholder: "Choose a password",
                Icon: FaLock,
              })}
              theme="ica"
            />
          </div>
        </div>
      </div>

      {/* SECTION 8: Submit */}
      <div className="text-center space-y-4 pt-6">
        <button
          type="submit"
          disabled={!canSubmit}
          className={`nextBtn ${
            formManager.isSubmitted ? "bg-[#4bb543]" : "bg-[#c6a54b]"
          } text-white border-none py-[15px] px-[50px] text-[17px] cursor-pointer rounded-[40px] outline-none appearance-none hover:opacity-80 text-base p-2.5 shadow-none font-montserrat disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {formManager.isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin" />
              Submitting... Please Wait.
            </span>
          ) : usernameStatus.checking ? (
            <span className="flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin" />
              Checking Username...
            </span>
          ) : usernameStatus.available === false &&
            usernameValue &&
            usernameValue.length < 4 ? (
            "Enter valid username"
          ) : usernameStatus.available === false ? (
            <span className="flex items-center justify-center gap-2">
              <FaTimesCircle />
              Username Not Available
            </span>
          ) : formManager.isSubmitted ? (
            <span className="flex items-center justify-center">
              <FaCheckCircle className="text-white mr-2" />
              Thank you. We received your submission!
            </span>
          ) : (
            "Submit Your Information"
          )}
        </button>
      </div>
    </form>
  );
};

export default InductionForm;
