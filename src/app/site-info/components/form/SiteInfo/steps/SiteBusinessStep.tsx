import type { FieldConfig } from "@/components/form/FieldRenderer";
import { ThemeType } from "@/components/form/inputs/themes";
import UniversalFormField from "@/components/form/UniversalFormField";
import FormFieldList from "@/components/form/utils/core/FormFieldList";
import StepHeading from "@/components/form/utils/core/StepHeading";
import type { SiteInfoFormData } from "@/zod/SiteInfoFormSchema";
import { FaBuilding, FaHome, FaMapMarkerAlt } from "react-icons/fa";
import type { SiteFormManager } from "../../SiteInfoForm";

const STATE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Please Select" },
  { value: "VIC", label: "Victoria" },
  { value: "NSW", label: "New South Wales" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
  { value: "NZ", label: "New Zealand" },
];

// State and Postcode share a row — rendered separately below.
const BUSINESS_FIELDS: FieldConfig<SiteInfoFormData>[] = [
  {
    name: "BusinessName",
    type: "text",
    label: "What is the business name of this location?",
    placeholder: "e.g. Joes Supermarket",
    Icon: FaBuilding,
  },
  {
    name: "Address",
    type: "text",
    label: "What is the number & street for this location?",
    placeholder: "e.g. 49 Commercial Road",
    Icon: FaHome,
  },
  {
    name: "Suburb",
    type: "text",
    label: "What is the suburb for this location?",
    placeholder: "e.g. Port Adelaide",
    Icon: FaMapMarkerAlt,
  },
];

const STATE_FIELD: FieldConfig<SiteInfoFormData> = {
  name: "State",
  type: "select",
  label: "What state is this location in?",
  options: STATE_OPTIONS,
  Icon: FaMapMarkerAlt,
};

const POSTCODE_FIELD: FieldConfig<SiteInfoFormData> = {
  name: "Postcode",
  type: "text",
  label: "Postcode",
  placeholder: "e.g. 5015",
  Icon: FaMapMarkerAlt,
};

interface SiteBusinessStepProps {
  formManager: SiteFormManager;
  theme?: string;
}

const SiteBusinessStep = ({
  formManager,
  theme = "dark",
}: SiteBusinessStepProps) => (
  <div className="form-page business-info mt-[40px]">
    <StepHeading title="Business Information" as="h2" />

    <div className="form-tab 480px:w-[90%] mx-auto">
      <FormFieldList
        fields={BUSINESS_FIELDS}
        formManager={formManager}
        theme={theme as ThemeType}
        autoComplete="new-password"
      />

      {/* State + Postcode inline row */}
      <div className="flex flex-col 600px:flex-row 600px:gap-4">
        <div className="600px:w-[80%]">
          <UniversalFormField
            {...formManager.getFieldProps(STATE_FIELD)}
            theme={theme as ThemeType}
            autoComplete="new-password"
          />
        </div>
        <div>
          <UniversalFormField
            {...formManager.getFieldProps(POSTCODE_FIELD)}
            theme={theme as ThemeType}
            autoComplete="new-password"
          />
        </div>
      </div>
    </div>
  </div>
);

export default SiteBusinessStep;
