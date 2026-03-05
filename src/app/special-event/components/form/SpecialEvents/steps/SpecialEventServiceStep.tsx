import { ThemeType } from "@/components/form/inputs/themes";
import FormFieldList from "@/components/form/utils/core/FormFieldList";
import StepHeading from "@/components/form/utils/core/StepHeading";
import { SPECIAL_EVENT_SERVICE_FIELDS } from "@/zod/SpecialEventFormSchema";
import { SpecialEventFormManager } from "../../SpecialEventForm";

interface SpecialEventServiceStepProps {
  formManager: SpecialEventFormManager;
  theme?: string;
}

const SpecialEventServiceStep = ({
  formManager,
  theme = "dark",
}: SpecialEventServiceStepProps) => (
  <div className="form-page other-info mt-[40px]">
    <StepHeading title="Other Information" as="h2" />

    <div className="form-tab 480px:w-[90%] mx-auto">
      <FormFieldList
        fields={SPECIAL_EVENT_SERVICE_FIELDS}
        formManager={formManager}
        theme={theme as ThemeType}
        autoComplete="new-password"
      />
    </div>
  </div>
);

export default SpecialEventServiceStep;
