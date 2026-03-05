import { ThemeType } from "@/components/form/inputs/themes";
import FormFieldList from "@/components/form/utils/core/FormFieldList";
import StepHeading from "@/components/form/utils/core/StepHeading";
import { SITE_INFO_SERVICE_FIELDS } from "@/zod/SiteInfoFormSchema";
import type { SiteFormManager } from "../../SiteInfoForm";

interface SiteServiceStepProps {
  formManager: SiteFormManager;
  theme?: string;
}

const SiteServiceStep = ({
  formManager,
  theme = "dark",
}: SiteServiceStepProps) => (
  <div className="form-page other-info mt-[40px]">
    <StepHeading title="Other Information" as="h2" />

    <div className="form-tab 480px:w-[90%] mx-auto">
      <FormFieldList
        fields={SITE_INFO_SERVICE_FIELDS}
        formManager={formManager}
        theme={theme as ThemeType}
        autoComplete="new-password"
      />
    </div>
  </div>
);

export default SiteServiceStep;
