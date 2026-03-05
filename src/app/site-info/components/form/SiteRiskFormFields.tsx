"use client";
import FormSubmitButton from "@/components/form/utils/core/FormSubmitButton";
import UniversalFormField from "@/components/form/UniversalFormField";
import ScrollableSection from "@/components/layout/ScrollbarSection";
import { SHARED_RISK_FIELDS } from "@/zod/SharedSiteSchemas";
import { FaMoneyBillAlt } from "react-icons/fa";
import type { SiteFormManager } from "./SiteInfoForm";
import { SpecialEventFormManager } from "@/app/special-event/components/form/SpecialEventForm";

const SiteRiskFormFields = ({
  formManager,
}: {
  formManager: SiteFormManager | SpecialEventFormManager;
}) => {
  const { submitButtonEnabled, isSubmitting, isSubmitted } = formManager;

  return (
    <ScrollableSection className="h-auto 992px:w-full p-0 mx-auto 992px:h-[480px] 600px:pr-10">
      {SHARED_RISK_FIELDS.map((field) => (
        <UniversalFormField
          key={field.name}
          {...formManager.getFieldProps(field)}
          Icon={field.name === "Amount" ? FaMoneyBillAlt : undefined}
          theme="legacy-hazard"
        />
      ))}

      {submitButtonEnabled && (
        <div className="button-controls-container 480px:w-[80%] mx-auto mt-12">
          <div className="button-section relative">
            <FormSubmitButton
              isSubmitting={isSubmitting}
              isSubmitted={isSubmitted}
              idleLabel="Submit this location"
              submittingLabel="Submitting, please wait..."
              submittedLabel="Thank you, we received your submission!"
            />
          </div>
        </div>
      )}
    </ScrollableSection>
  );
};

export default SiteRiskFormFields;
