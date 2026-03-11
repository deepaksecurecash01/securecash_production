"use client";
import type { FieldConfig } from "@/components/form/FieldRenderer";
import FormBackButton from "@/components/form/utils/core/FormBackButton";
import FormErrorBanner from "@/components/form/utils/core/FormErrorBanner";
import FormFieldList from "@/components/form/utils/core/FormFieldList";
import FormSubmitButton from "@/components/form/utils/core/FormSubmitButton";
import HoneypotField from "@/components/form/utils/core/HoneypotField";
import StepHeading from "@/components/form/utils/core/StepHeading";
import { useFormManager } from "@/hooks/useFormManager";
import {
  QUOTE_DEFAULT_VALUES,
  QUOTE_SCHEMAS,
  QuoteFormData,
} from "@/zod/QuoteFormSchema";
import { FieldValues } from "react-hook-form";
import {
  FaComments,
  FaEnvelope,
  FaHome,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import BankingStep from "./steps/BankingStep";
import ChangeStep from "./steps/ChangeStep";
import QuoteSuccessMessage from "./QuoteSuccessMessage";
import { captureError, captureEvent } from "@/utils/monitoring";

const SERVICE_OPTIONS = [
  { label: "Banking", value: "Banking" },
  { label: "Change", value: "Change" },
];

const QUOTE_FIELDS: FieldConfig[] = [
  {
    name: "FullName",
    type: "text",
    label: "Full Name",
    placeholder: "Enter your full name",
    Icon: FaUser,
  },
  {
    name: "Organisation",
    type: "text",
    label: "Organisation Name",
    placeholder: "Enter your organisation's name",
    Icon: FaUsers,
  },
  {
    name: "Phone",
    type: "tel",
    label: "Phone Number",
    placeholder: "Enter your phone number",
    Icon: FaPhone,
  },
  {
    name: "Referrer",
    type: "text",
    label: "Where Did You Hear About Us?",
    placeholder: "Enter where did you hear about us",
    Icon: FaComments,
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
    label: "Postal Address",
    placeholder: "Enter your postal address",
    Icon: FaHome,
  },
  {
    name: "Locations",
    type: "text",
    label: "Location/s For Service",
    placeholder: "Enter location/s for the service (Suburb, State, Postcode)",
    Icon: FaMapMarkerAlt,
  },
  {
    name: "Service",
    type: "checkbox-group",
    label: "Services You Require",
    options: SERVICE_OPTIONS,
    variant: "horizontal",
  },
];

const QuoteInitialStep = ({
  formManager,
}: {
  formManager: QuoteFormManager;
}) => (
  <div className="form-page quote">
    <StepHeading
      title="Want a quote from SecureCash?"
      subtitle="We Just Need A Few Details"
      as="h2"
    />

    <div className="form-tab 480px:w-[90%] mx-auto">
      <FormFieldList
        fields={QUOTE_FIELDS}
        formManager={formManager}
        theme="dark"
      />
    </div>
  </div>
);

const QuoteForm = ({ className }: { className?: string }) => {
  const formManager = useFormManager({
    schema: QUOTE_SCHEMAS,
    defaultValues: QUOTE_DEFAULT_VALUES,
    theme: "dark",
    formType: "quote",
    formId: "Quote",
    multiStep: {
      steps: ["quote", "banking", "change"],
      conditional: true,
      getNextSteps: (formData: FieldValues) => {
        const services = formData.Service || [];
        const nextSteps: string[] = [];
        if (services.includes("Banking")) nextSteps.push("banking");
        if (services.includes("Change")) nextSteps.push("change");
        return nextSteps;
      },
    },
    onSuccess: () => {},
    onError: (error: unknown) => captureError(error, { form: "quote" }),
    prepareData: async (data: QuoteFormData) => ({
      ...data,
      formType: "quote",
    }),
  });

  const { stepId, isFirst } = formManager.getCurrentStep();
  const userName = formManager.getStepData().FullName || "";

  const renderCurrentStep = () => {
    switch (stepId) {
      case "quote":
        return <QuoteInitialStep formManager={formManager} />;
      case "banking":
        return <BankingStep formManager={formManager} theme="dark" />;
      case "change":
        return <ChangeStep formManager={formManager} theme="dark" />;
      default:
        return null;
    }
  };

  const getButtonLabel = () => {
    if (stepId === "quote") return "Next";
    if (formManager.isLastStep()) return "Submit";
    return "Next";
  };

  return (
    <div
      className={`float-none w-full mx-auto relative left-0 flex-1 flex justify-center ${className}`}
    >
      <form
        className="forms-quote-v2 h-auto mx-2.5 992px:mx-0 px-[30px] 1366px:h-full forms-quote submit-status mt-4 992px:mt-0 w-full lg:mt-0 lg:mb-0 992px:w-[450px] 1100px:w-[480px] 1200px:w-[500px] 1280px:w-[546px] shadow-[3px_3px_5px_0px_rgba(0,0,0,0.75)] text-center py-8 rounded-[6px] bg-[#1a1a1a]"
        data-formid="Quote"
        onSubmit={formManager.handleSubmit}
        noValidate
        aria-label="Request a quote form"
      >
        {!isFirst && stepId !== "risk" && !formManager.isSubmitted && (
          <FormBackButton onClick={formManager.goBack} />
        )}

        <HoneypotField control={formManager.control} />

        {formManager.isSubmitted ? (
          <QuoteSuccessMessage userName={userName} onReset={formManager.resetForm} />
        ) : (
          renderCurrentStep()
        )}

        <FormErrorBanner error={formManager.submissionError} />

        {!formManager.isSubmitted && (
          <div className="button-controls-container w-[80%] mx-auto mt-10">
            <div className="button-section relative">
              <FormSubmitButton
                isSubmitting={formManager.isSubmitting}
                isSubmitted={formManager.isSubmitted}
                idleLabel={getButtonLabel()}
                submittingLabel="Submitting..."
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default QuoteForm;
export type QuoteFormManager = ReturnType<typeof useFormManager<QuoteFormData>>;
