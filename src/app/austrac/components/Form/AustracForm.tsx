"use client";

import type { FieldConfig } from "@/components/form/FieldRenderer";
import FormErrorBanner from "@/components/form/utils/core/FormErrorBanner";
import FormFieldList from "@/components/form/utils/core/FormFieldList";
import FormSubmitButton from "@/components/form/utils/core/FormSubmitButton";
import HoneypotField from "@/components/form/utils/core/HoneypotField";
import { useFormManager } from "@/hooks/useFormManager";
import { captureError } from "@/utils/monitoring";
import {
  AUSTRAC_DEFAULT_VALUES,
  AustracFormData,
  AustracFormSchema,
  ORGANISATION_TYPES,
} from "@/zod/AustracFormSchema";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  FaBuilding,
  FaEnvelope,
  FaGlobe,
  FaHome,
  FaIdCard,
  FaList,
  FaMapMarkerAlt,
  FaUsers,
} from "react-icons/fa";

const ORG_TYPE_OPTIONS = [
  { value: "", label: "Please Select" },
  ...ORGANISATION_TYPES.map((type) => ({ value: type, label: type })),
];

const STATE_OPTIONS = [
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

const AUSTRAC_FIELDS: FieldConfig<AustracFormData>[] = [
  {
    name: "Organisation",
    type: "text",
    label: "What is your organisation's name?",
    placeholder: "e.g. Smith Holdings Pty Ltd or South Park Primary School",
    Icon: FaBuilding,
  },
  {
    name: "ABN",
    type: "abn",
    label: "What is your organisation's ABN number?",
    placeholder: "as per the ASIC register. Eg 45 567 678 901",
    Icon: FaIdCard,
  },
  {
    name: "Website",
    type: "url",
    label: "What is the organisation's main website?",
    placeholder: "e.g. https://www.smithholdings.com.au",
    Icon: FaGlobe,
  },
  {
    name: "OrganisationEmail",
    type: "email",
    label: "What is the organisation's main email address?",
    placeholder: "e.g. admin@smithholdings.com.au",
    Icon: FaEnvelope,
  },
  {
    name: "OrganisationType",
    type: "select",
    label: "What is the organisation's structure type?",
    Icon: FaList,
    options: ORG_TYPE_OPTIONS,
  },
  {
    name: "Address",
    type: "text",
    label: "What is the address of the head office?",
    placeholder: "e.g. 38 Main South Road Blacktown QLD 6987",
    Icon: FaHome,
  },
  {
    name: "State",
    type: "select",
    label: "In which state is the head office?",
    Icon: FaMapMarkerAlt,
    options: STATE_OPTIONS,
  },
  {
    name: "Personnel",
    type: "textarea",
    label:
      "Please provide the full names & positions of all the key people within the organisation structure;",
    placeholder: "Directors, Chairperson, Secretary etc.",
    rows: 6,
    Icon: FaUsers,
  },
];

interface AustracFormProps {
  className?: string;
  setOrganisation?: (org: string) => void;
  setABN?: (abn: string) => void;
}

const AustracForm = ({
  className,
  setOrganisation,
  setABN,
}: AustracFormProps) => {
  const router = useRouter();

  const formManager = useFormManager({
    schema: AustracFormSchema,
    defaultValues: AUSTRAC_DEFAULT_VALUES,
    theme: "dark",
    formType: "austrac",
    formId: "AUSTRAC",
    // onSuccess: () => router.push("/site-info"),
    onError: (error: unknown) => captureError(error, { form: "austrac" }),
    prepareData: async (data: AustracFormData) => ({
      ...data,
      formType: "austrac",
    }),
  });

  const organisationValue = formManager.watch("Organisation");
  const abnValue = formManager.watch("ABN");

  useEffect(() => {
    if (organisationValue) setOrganisation?.(organisationValue);
  }, [organisationValue, setOrganisation]);

  useEffect(() => {
    if (abnValue && setABN) setABN(abnValue);
  }, [abnValue, setABN]);

  return (
    <div
      className={`float-none w-full mx-auto relative left-0 flex-1 flex justify-center ${className}`}
    >
      <div className="forms-quote-v2 h-auto 768px:mx-2.5 992px:mx-0 px-6 1366px:h-full forms-quote submit-status mt-4 992px:mt-0 992px:mb-16 w-full lg:mt-0 lg:mb-0 992px:w-[450px] 1100px:w-[480px] 1200px:w-[500px] 1280px:w-[600px] shadow-[3px_3px_5px_0px_rgba(0,0,0,0.75)] text-center py-8 rounded-[6px] bg-[#1a1a1a]">
        <form
          className="text-center"
          data-formid="AUSTRAC"
          onSubmit={formManager.handleSubmit}
          noValidate
          aria-label="AUSTRAC compliance form"
        >
          <div className="form-page austrac">
            <div className="form-tab 480px:w-[90%] mx-auto">
              <HoneypotField control={formManager.control} />

              <FormFieldList
                fields={AUSTRAC_FIELDS}
                formManager={formManager}
                theme="dark"
              />
            </div>
          </div>

          <FormErrorBanner error={formManager.submissionError} />

          <div className="button-controls-container 480px:w-[80%] mx-auto mt-9 mb-2">
            <div className="button-section relative">
              <FormSubmitButton
                isSubmitting={formManager.isSubmitting}
                isSubmitted={formManager.isSubmitted}
                idleLabel="Continue to Next Step"
                submittingLabel="Submitting... Please Wait."
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AustracForm;
