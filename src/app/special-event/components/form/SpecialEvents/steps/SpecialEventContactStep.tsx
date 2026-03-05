import { ThemeType } from "@/components/form/inputs/themes";
import FormFieldList from "@/components/form/utils/core/FormFieldList";
import StepHeading from "@/components/form/utils/core/StepHeading";
import { SPECIAL_EVENT_CONTACT_FIELDS } from "@/zod/SpecialEventFormSchema";
import { SpecialEventFormManager } from "../../SpecialEventForm";

interface SpecialEventContactStepProps {
  formManager: SpecialEventFormManager;
  theme?: string;
}

const SpecialEventContactStep = ({
  formManager,
  theme = "dark",
}: SpecialEventContactStepProps) => (
  <div className="form-page contact-info mt-[40px]">
    <StepHeading title="Contact Information" as="h2" />

    <div className="form-tab 480px:w-[90%] mx-auto">
      <FormFieldList
        fields={SPECIAL_EVENT_CONTACT_FIELDS}
        formManager={formManager}
        theme={theme as ThemeType}
        autoComplete="new-password"
      />
    </div>
  </div>
);

export default SpecialEventContactStep;
