"use client";
import HoneypotField from "@/components/form/utils/core/HoneypotField";
import FormSubmitButton from "@/components/form/utils/core/FormSubmitButton";
import UniversalFormField from "@/components/form/UniversalFormField";
import { useFormManager } from "@/hooks/useFormManager";
import { formatBirthdayForAPI } from "@/utils/formHelpers";
import type { FieldConfig } from "@/components/form/FieldRenderer";
import {
  TermsFormSchema,
  TERMS_DEFAULT_VALUES,
  type TermsFormData,
} from "@/zod/TermsFormSchema";
import {
  FaUser,
  FaBriefcase,
  FaEnvelope,
  FaCalendarAlt,
  FaUsers,
  FaIdCard,
  FaPenNib,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TermsFormProps {
  setName?: (name: string) => void;
  setPosition?: (position: string) => void;
  setOrganisation?: (org: string) => void;
  setAbn?: (abn: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDateOfAcceptance = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${day}/${month}/${year}, ${displayHours}:${minutes}:${seconds} ${ampm}`;
};

const formatAgreementDate = (): string =>
  new Date()
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, " / ");

// ─── Field Config ─────────────────────────────────────────────────────────────

const INPUT_FIELDS: FieldConfig<TermsFormData>[] = [
  {
    name: "Name",
    type: "text",
    label: "What is your full name?",
    placeholder: "Enter your full name",
    Icon: FaUser,
  },
  {
    name: "Position",
    type: "text",
    label: "What is your position in the organisation?",
    placeholder: "Enter your position in the organisation",
    Icon: FaBriefcase,
  },
  {
    name: "Email",
    type: "email",
    label: "What is your email address?",
    placeholder: "Enter your email address",
    Icon: FaEnvelope,
  },
  {
    name: "Birthdate",
    type: "date",
    label: "What is your date of birth?",
    dayPlaceholder: "DD",
    monthPlaceholder: "MM",
    yearPlaceholder: "YYYY",
    format: "dd/MM/yyyy",
    Icon: FaCalendarAlt,
  },
  {
    name: "Organisation",
    type: "text",
    label: "What is your organisation's name?",
    placeholder: "Enter your organisation's name",
    Icon: FaUsers,
  },
  {
    name: "ABN",
    type: "abn",
    label: "What is your organisation's ABN number?",
    placeholder: "Enter your organisation's ABN number (11 digits)",
    Icon: FaIdCard,
  },
  {
    name: "Signature",
    type: "signature",
    label: "Please sign below to execute this agreement",
    Icon: FaPenNib,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const TermsForm = ({
  setName,
  setPosition,
  setOrganisation,
  setAbn,
}: TermsFormProps) => {
  const router = useRouter();

  const formManager = useFormManager({
    schema: TermsFormSchema,
    defaultValues: TERMS_DEFAULT_VALUES,
    theme: "dark",
    formType: "terms",
    formId: "Terms",
    // onSuccess: () => router.push("/austrac"),
    onError: (error: unknown) => console.error("Terms submission error", error),
    prepareData: async (data: TermsFormData) => ({
      ...data,
      "Organisation Name": data.Organisation,
      "Organisation Role": data.Position,
      "Organisation ABN": data.ABN,
      "Full Name": data.Name,
      Birthday: formatBirthdayForAPI(data.Birthdate),
      Email: data.Email,
      formType: "terms",
      "Date of Acceptance": formatDateOfAcceptance(),
      "Agreement Commencement": `**THIS AGREEMENT COMMENCES ON THE:** ${formatAgreementDate()} and will be ongoing unless either party terminates this Agreement in accordance with the termination provisions herein ("Expiry").`,
    }),
  });

  // Sync watched values up to parent for the live preview in FormSection
  const nameValue = formManager.watch("Name");
  const positionValue = formManager.watch("Position");
  const organisationValue = formManager.watch("Organisation");
  const abnValue = formManager.watch("ABN");

  useEffect(() => {
    if (nameValue && setName) setName(nameValue);
    if (positionValue && setPosition) setPosition(positionValue);
    if (organisationValue && setOrganisation)
      setOrganisation(organisationValue);
    if (abnValue && setAbn) setAbn(abnValue);
  }, [
    nameValue,
    positionValue,
    organisationValue,
    abnValue,
    setName,
    setPosition,
    setOrganisation,
    setAbn,
  ]);

  return (
    <div className="float-none w-full mx-auto relative left-0 flex-1 flex justify-center">
      <div className="forms-quote-v2 h-auto 768px:mx-2.5 992px:mx-0 px-6 1366px:h-full forms-quote submit-status mt-4 992px:mt-0 992px:mb-16 w-full lg:mt-0 lg:mb-0 992px:w-[450px] 1100px:w-[480px] 1200px:w-[500px] 1280px:w-[600px] shadow-[3px_3px_5px_0px_rgba(0,0,0,0.75)] text-center py-16 rounded-[6px] bg-[#1a1a1a]">
        <form
          className="text-center"
          data-formid="Terms"
          onSubmit={formManager.handleSubmit}
          noValidate
          autoComplete="off"
        >
          <div className="form-page terms">
            <h3 className="text-white font-normal text-center capitalize pb-4 text-[26px] leading-[30px] font-montserrat">
              Service Agreement
            </h3>
            <hr className="w-[100px] mx-auto mt-2.5 mb-4 bg-primary h-[4px] rounded-[5px] border-0" />

            <div className="form-tab 480px:w-[90%] mx-auto">
              <HoneypotField control={formManager.control} />

              {INPUT_FIELDS.map((field) => (
                <div
                  key={field.name}
                  className="relative flex flex-col h-full justify-between"
                >
                  <UniversalFormField
                    {...formManager.getFieldProps(field)}
                    theme="dark"
                    autoComplete="new-password"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="button-controls-container 480px:w-[80%] mx-auto mt-12">
            <div className="button-section relative">
              <FormSubmitButton
                isSubmitting={formManager.isSubmitting}
                isSubmitted={formManager.isSubmitted}
                idleLabel="I agree with the above Terms & Conditions"
                submittingLabel="Submitting, please wait..."
                submittedLabel="Thank you, we received your submission!"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TermsForm;
