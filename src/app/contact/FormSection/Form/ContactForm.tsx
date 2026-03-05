"use client";

import type { FieldConfig } from "@/components/form/FieldRenderer";
import UniversalFormField from "@/components/form/UniversalFormField";
import FormErrorBanner from "@/components/form/utils/core/FormErrorBanner";
import FormFieldList from "@/components/form/utils/core/FormFieldList";
import FormSubmitButton from "@/components/form/utils/core/FormSubmitButton";
import HoneypotField from "@/components/form/utils/core/HoneypotField";
import { useFormManager } from "@/hooks/useFormManager";
import { formatDateForAPI } from "@/utils/formHelpers";
import {
  CONTACT_DEFAULT_VALUES,
  ContactFormData,
  ContactFormSchema,
} from "@/zod/ContactFormSchema";
import {
  FaBuilding,
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import ContactSuccessMessage from "./ContactSuccessMessage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OptionProps {
  value: string;
  label: string;
}

// ─── Options ──────────────────────────────────────────────────────────────────

const DEPARTMENTS: OptionProps[] = [
  { value: "", label: "Please select a department..." },
  { value: "customers", label: "Customer Service" },
  { value: "sales", label: "Sales" },
  { value: "operations", label: "Operations" },
];

const CALLBACK_TIMES: OptionProps[] = [
  { value: "", label: "Please Select" },
  { value: "9:30am", label: "9:30am" },
  { value: "10:00am", label: "10:00am" },
  { value: "10:30am", label: "10:30am" },
  { value: "11:00am", label: "11:00am" },
  { value: "11:30am", label: "11:30am" },
  { value: "12:00pm", label: "12:00pm" },
  { value: "12:30pm", label: "12:30pm" },
  { value: "1:00pm", label: "1:00pm" },
  { value: "1:30pm", label: "1:30pm" },
  { value: "2:00pm", label: "2:00pm" },
  { value: "2:30pm", label: "2:30pm" },
  { value: "3:00pm", label: "3:00pm" },
  { value: "3:30pm", label: "3:30pm" },
  { value: "4:00pm", label: "4:00pm" },
  { value: "4:30pm", label: "4:30pm" },
  { value: "5:00pm", label: "5:00pm" },
  { value: "5:30pm", label: "5:30pm" },
  { value: "6:00pm", label: "6:00pm" },
  { value: "6:30pm", label: "6:30pm" },
  { value: "7:00pm", label: "7:00pm" },
];

const STATES: OptionProps[] = [
  { value: "", label: "Please Select" },
  { value: "NSW", label: "NSW" },
  { value: "VIC", label: "VIC" },
  { value: "QLD", label: "QLD" },
  { value: "WA", label: "WA" },
  { value: "SA", label: "SA" },
  { value: "TAS", label: "TAS" },
  { value: "ACT", label: "ACT" },
  { value: "NT", label: "NT" },
  { value: "NZ", label: "NZ" },
];

const CALLBACK_CHECKBOX_OPTIONS: OptionProps[] = [
  {
    value: "Yes, please.",
    label: "I would like to be called back by a representative.",
  },
];

const CONTACT_FIELDS: FieldConfig<ContactFormData>[] = [
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
    placeholder: "Enter your organisation name",
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
    name: "Email",
    type: "email",
    label: "Email Address",
    placeholder: "Your email address",
    Icon: FaEnvelope,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const ContactForm = () => {
  const formManager = useFormManager({
    schema: ContactFormSchema,
    defaultValues: CONTACT_DEFAULT_VALUES,
    theme: "light",
    formType: "contact",
    formId: "Contact",
    onSuccess: () => console.log("Contact form submitted successfully"),
    onError: (error: unknown) => console.error("Contact form error", error),
    prepareData: async (data: ContactFormData) => ({
      ...data,
      formType: "contact",
      ...(data.CallbackDate && {
        CallbackDate: formatDateForAPI(data.CallbackDate),
      }),
    }),
  });

  const callbackChecked = formManager.watch("ChkCallBack");
  // isCallbackDisabled drives UI opacity/pointer-events only — NOT the
  // disabled prop. Disabled removes fields from RHF state, which causes
  // superRefine to receive undefined instead of the current field value.
  const isCallbackDisabled = !callbackChecked || callbackChecked.length === 0;
  const userName = formManager.getValues().FullName || "";

  return (
    <div className="float-none 992px:w-[60%] 992px:float-left relative left-0 flex justify-center 414px:mx-4 992px:mx-0">
      <div className="forms-franchise-v2 rounded-r-[8px] shadow-[3px_3px_10px_0px_rgba(0,0,0,0.2)] h-auto 992px:mx-0 px-8 480px:px-[5%] 1366px:h-full submit-status 992px:mt-4 992px:mt-0 992px:mb-16 w-full lg:mt-0 lg:mb-0 text-center py-8 bg-[#f1f1f1] relative">
        <form
          className="text-center"
          data-formid="Contact"
          onSubmit={formManager.handleSubmit}
          noValidate
          aria-label="Contact form"
        >
          <div className="form-page contact">
            <div className="form-tab 480px:w-[90%] mx-auto">
              <HoneypotField control={formManager.control} />

              <UniversalFormField
                {...formManager.getFieldProps({
                  name: "Department",
                  type: "select",
                  label: "Which Department?",
                  Icon: FaBuilding,
                  options: DEPARTMENTS,
                })}
                theme="light"
              />

              <FormFieldList
                fields={CONTACT_FIELDS}
                formManager={formManager}
                theme="light"
              />

              <div className="relative mt-6">
                <UniversalFormField
                  {...formManager.getFieldProps({
                    name: "ChkCallBack",
                    type: "checkbox-group",
                    label: "",
                    options: CALLBACK_CHECKBOX_OPTIONS,
                    variant: "agreement",
                  })}
                  theme="light"
                />
              </div>

              {/* Callback fields — always rendered so RHF keeps them in form
                  state. UI interaction is blocked via pointer-events when
                  unchecked. Using `disabled` would drop values from RHF state
                  and cause superRefine to receive undefined for these fields. */}
              <div
                className={`transition-opacity duration-200 ${
                  isCallbackDisabled
                    ? "opacity-40 pointer-events-none"
                    : "opacity-100"
                }`}
              >
                <UniversalFormField
                  {...formManager.getFieldProps({
                    name: "CallbackDate",
                    type: "date",
                    label:
                      "Pick a time that suits you and we'll call you back!",
                    dayPlaceholder: "DD",
                    monthPlaceholder: "MM",
                    yearPlaceholder: "YYYY",
                    format: "dd/MM/yyyy",
                  })}
                  theme="light"
                />

                <div className="flex flex-col md:flex-row md:gap-4">
                  <div className="w-full md:w-1/2">
                    <UniversalFormField
                      {...formManager.getFieldProps({
                        name: "CallbackTime",
                        type: "select",
                        label: "What is the best time?",
                        Icon: FaClock,
                        options: CALLBACK_TIMES,
                      })}
                      theme="light"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <UniversalFormField
                      {...formManager.getFieldProps({
                        name: "CallbackState",
                        type: "select",
                        label: "Which state are you from?",
                        Icon: FaMapMarkerAlt,
                        options: STATES,
                      })}
                      theme="light"
                    />
                  </div>
                </div>
              </div>

              <UniversalFormField
                {...formManager.getFieldProps({
                  name: "Message",
                  type: "textarea",
                  label: "How can we help?",
                  placeholder: "Briefly let us know how we can help you?",
                  rows: 3,
                })}
                theme="light"
              />
            </div>
          </div>

          {formManager.isSubmitted && (
            <ContactSuccessMessage
              userName={userName}
              onReset={formManager.resetForm}
            />
          )}

          <FormErrorBanner error={formManager.submissionError} />

          <div className="button-controls-container w-[80%] mx-auto mt-7">
            <div className="button-section relative">
              <FormSubmitButton
                isSubmitting={formManager.isSubmitting}
                isSubmitted={formManager.isSubmitted}
                idleLabel="Send Message"
                submittingLabel="Sending Message... Please Wait."
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
