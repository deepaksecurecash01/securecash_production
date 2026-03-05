"use client";

import { useEffect, useState } from "react";
import { PopupModal } from "react-calendly";
import {
  FaEnvelope,
  FaHome,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaQuestionCircle,
  FaUser,
} from "react-icons/fa";
import type { FieldConfig } from "@/components/form/FieldRenderer";
import FormErrorBanner from "@/components/form/utils/core/FormErrorBanner";
import FormFieldList from "@/components/form/utils/core/FormFieldList";
import FormSubmitButton from "@/components/form/utils/core/FormSubmitButton";
import HoneypotField from "@/components/form/utils/core/HoneypotField";
import UniversalFormField from "@/components/form/UniversalFormField";
import { useFormManager } from "@/hooks/useFormManager";
import {
  FRANCHISE_DEFAULT_VALUES,
  FranchiseFormData,
  FranchiseFormSchema,
} from "@/zod/FranchiseFormSchema";
import FranchiseSuccessMessage from "./FranchiseSuccessMessage";


const CALENDLY_URL =
  "https://calendly.com/jo_securecash?hide_gdpr_banner=1&primary_color=c7a652";

const REFERRAL_OPTIONS = [
  { value: "", label: "Please Select" },
  { value: "Google", label: "Google" },
  { value: "Business For Sale", label: "Business For Sale" },
  { value: "Facebook", label: "Facebook" },
  { value: "Instagram", label: "Instagram" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Other Social Media", label: "Other Social Media" },
  { value: "Other", label: "Other" },
];


const FRANCHISE_FIELDS: FieldConfig<FranchiseFormData>[] = [
  {
    name: "FullName",
    type: "text",
    label: "Full Name",
    placeholder: "Enter your full name",
    Icon: FaUser,
  },
  {
    name: "Phone",
    type: "tel",
    label: "Phone Number",
    placeholder: "Enter your phone number",
    Icon: FaPhone,
  },
  {
    name: "Email",
    type: "email",
    label: "Email Address",
    placeholder: "Your email address",
    Icon: FaEnvelope,
  },
  {
    name: "Address",
    type: "text",
    label: "Address",
    placeholder: "Enter your address",
    Icon: FaHome,
  },
  {
    name: "InterestedArea",
    type: "text",
    label: "Territory/Area/Suburb of Interest",
    placeholder: "What territory/area/suburb are you interested in?",
    Icon: FaMapMarkerAlt,
  },
  {
    name: "ReasonForInterest",
    type: "textarea",
    label: "What interests you in a SecureCash Franchise?",
    placeholder:
      "Briefly tell us why you're interested in a SecureCash franchise",
    rows: 3,
    Icon: FaInfoCircle,
  },
  {
    name: "ReferralSource",
    type: "select",
    label: "Where did you hear about this Franchise Opportunity?",
    options: REFERRAL_OPTIONS,
    Icon: FaQuestionCircle,
  },
];


const FranchiseForm = ({ className }: { className?: string }) => {
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const [calendlyData, setCalendlyData] = useState<FranchiseFormData | null>(
    null,
  );
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

  // Defer rootElement to avoid SSR issues with document.body
  useEffect(() => {
    setRootElement(document.body);
  }, []);

  const formManager = useFormManager({
    schema: FranchiseFormSchema,
    defaultValues: FRANCHISE_DEFAULT_VALUES,
    theme: "light",
    formType: "franchise",
    formId: "Franchise",
    onSuccess: (_result: unknown, finalData: unknown) => {
      setCalendlyData(finalData as FranchiseFormData);
      setIsCalendlyOpen(true);
    },
    onError: (error: unknown) =>
      console.error("Franchise submission error", error),
    prepareData: async (data: FranchiseFormData) => ({
      ...data,
      formType: "franchise",
    }),
  });

  const { setValue } = formManager;
  const referralSource = formManager.watch("ReferralSource");
  const showOtherField = referralSource === "Other";
  const userName = formManager.getStepData().FullName || "";


  useEffect(() => {
    if (!showOtherField) setValue("ReferralSourceOther", "");
  }, [showOtherField, setValue]);

  const handleCalendlyClose = () => {
    setIsCalendlyOpen(false);
    setCalendlyData(null);
    formManager.resetForm();
  };

  return (
    <div className="float-none 992px:w-[60%] 992px:float-left relative left-0 flex justify-center 414px:mx-4 992px:mx-0">
      <div className="forms-franchise-v2 rounded-r-[8px] shadow-[3px_3px_10px_0px_rgba(0,0,0,0.2)] h-auto 992px:mx-0 px-8 480px:px-[5%] 1366px:h-full submit-status 992px:mt-4 992px:mt-0 992px:mb-16 w-full lg:mt-0 lg:mb-0 text-center py-8 bg-[#f1f1f1] relative">
        <form
          className="text-center"
          data-formid="Franchise"
          onSubmit={formManager.handleSubmit}
          noValidate
          aria-label="Franchise enquiry form"
        >
          <div className="form-page franchise">
            <div className="form-tab 480px:w-[90%] mx-auto">
              <HoneypotField control={formManager.control} />

              <FormFieldList
                fields={FRANCHISE_FIELDS}
                formManager={formManager}
                theme="light"
              />

              {/* Conditional field — only shown when "Other" is selected */}
              {showOtherField && (
                <UniversalFormField
                  {...formManager.getFieldProps({
                    name: "ReferralSourceOther",
                    type: "text",
                    label: "Please specify",
                    placeholder: "Please specify where you heard about us",
                    Icon: FaQuestionCircle,
                  })}
                  theme="light"
                />
              )}

              <p className="text-primary-text text-[14px] font-medium mt-4 mb-2 w-full text-left px-2 768px:px-0">
                After submitting the form, please pick a time from the popup
                screen for a video meeting.
              </p>
            </div>
          </div>

          {formManager.isSubmitted && (
            <FranchiseSuccessMessage userName={userName} />
          )}

          <FormErrorBanner error={formManager.submissionError} />

          <div className="button-controls-container w-[80%] mx-auto mt-7">
            <div className="button-section relative">
              <FormSubmitButton
                isSubmitting={formManager.isSubmitting}
                isSubmitted={formManager.isSubmitted}
                idleLabel="Submit"
                submittingLabel="Submitting... Please Wait."
              />
            </div>
          </div>
        </form>
      </div>

      {calendlyData && isCalendlyOpen && rootElement && (
        <PopupModal
          url={CALENDLY_URL}
          prefill={{
            name: calendlyData.FullName,
            email: calendlyData.Email,
            customAnswers: {
              a1: calendlyData.InterestedArea,
            },
          }}
          onModalClose={handleCalendlyClose}
          open={isCalendlyOpen}
          rootElement={rootElement}
        />
      )}
    </div>
  );
};

export default FranchiseForm;
