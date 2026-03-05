"use client";
import FormErrorBanner from "@/components/form/utils/core/FormErrorBanner";
import FormSubmitButton from "@/components/form/utils/core/FormSubmitButton";
import HoneypotField from "@/components/form/utils/core/HoneypotField";
import { useFormManager } from "@/hooks/useFormManager";
import {
  ICA_DEFAULT_VALUES,
  IcaFormData,
  IcaFormSchema,
} from "@/zod/IcaFormSchema";
import type { IcaAgreementData } from "./IcaAgreementClauses";
import AgreementTermSection from "./sections/AgreementTermSection";
import DeedOfGuaranteeSection from "./sections/DeedOfGuaranteeSection";
import DriversSection from "./sections/DriversSection";
import EDocketSystemSection from "./sections/EDocketSystemSection";
import ExecutedAsDeedSection from "./sections/ExecutedAsDeedSection";
import FormHeader from "./sections/FormHeader";
import LicensingInsuranceSection from "./sections/LicensingInsuranceSection";
import PersonalDetailsSection from "./sections/PersonalDetailsSection";

export interface CompanyInfo {
  name: string;
  acn: string;
  address: string;
  email: string;
}

export type { IcaAgreementData };

const COMPANY_INFO: CompanyInfo = {
  name: "Office Central Pty Ltd",
  acn: "ACN 668 461 050",
  address: "30 Church Hill Road, Old Noarlunga SA 5168",
  email: "sales@securecash.com.au",
};

const FILE_UPLOAD_CONFIG = {
  enabled: true,
  fields: [
    { field: "GovernmentID", prefix: "Guarantors Government ID" },
    { field: "WitnessID", prefix: "Witness ID" },
    { field: "SecurityLicense", prefix: "Security or Masters License" },
    { field: "CITInsurance", prefix: "CIT Insurance" },
  ],
  compression: {
    targetSizeKB: 400,
    maxSizeMB: 5,
    allowedTypes: ["image/jpeg", "image/png", "image/jpg"],
  },
  concurrencyLimit: 2,
};

const IcaForm = ({
  agreementTermData,
  deedOfGuaranteeData,
}: {
  agreementTermData: IcaAgreementData;
  deedOfGuaranteeData: IcaAgreementData;
}) => {
  const formManager = useFormManager({
    schema: IcaFormSchema,
    defaultValues: ICA_DEFAULT_VALUES,
    formType: "ica",
    formId: "ICA",
    theme: "ica",
    fileUpload: FILE_UPLOAD_CONFIG,
    onSuccess: () => {
      setTimeout(() => formManager.resetForm(), 15000);
    },
    onError: (error: unknown) => console.error("ICA Error", error),
    prepareData: async (data: IcaFormData) => ({ ...data, formType: "ica" }),
  });

  return (
    <section className="1024px:py-[120px] 768px:bg-[#f2f2f2]">
      <div className="max-w-[1200px] mx-auto">
        <form
          onSubmit={formManager.handleSubmit}
          className="bg-white rounded-lg shadow-lg px-12 py-16 space-y-8"
          noValidate
          autoComplete="off"
        >
          <HoneypotField control={formManager.control} />

          <FormHeader COMPANY_INFO={COMPANY_INFO} />

          <PersonalDetailsSection formManager={formManager} />

          <AgreementTermSection
            formManager={formManager}
            agreementTermData={agreementTermData}
          />

          <DeedOfGuaranteeSection
            formManager={formManager}
            deedOfGuaranteeData={deedOfGuaranteeData}
            COMPANY_INFO={COMPANY_INFO}
          />

          <ExecutedAsDeedSection formManager={formManager} />

          <LicensingInsuranceSection formManager={formManager} />

          <EDocketSystemSection COMPANY_INFO={COMPANY_INFO} />

          <DriversSection formManager={formManager} />

          <FormErrorBanner error={formManager.submissionError} />

          <div className="text-center">
            <FormSubmitButton
              isSubmitting={formManager.isSubmitting}
              isSubmitted={formManager.isSubmitted}
              idleLabel="Click here to execute this deed & agreement"
              submittingLabel="Submitting... Please Wait."
              submittedLabel="Thank you. We received your submission!"
              variant="ica"
            />
          </div>
        </form>
      </div>
    </section>
  );
};

export default IcaForm;
export type IcaFormManager = ReturnType<typeof useFormManager<IcaFormData>>;
