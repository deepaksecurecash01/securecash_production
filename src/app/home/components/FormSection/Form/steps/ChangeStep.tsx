import type { FieldConfig } from "@/components/form/FieldRenderer";
import { ThemeType } from "@/components/form/inputs/themes";
import FormFieldList from "@/components/form/utils/core/FormFieldList";
import StepHeading from "@/components/form/utils/core/StepHeading";
import { QuoteFormData } from "@/zod/QuoteFormSchema";
import { FaCalendarAlt, FaDollarSign, FaMoneyBillAlt } from "react-icons/fa";
import type { QuoteFormManager } from "../QuoteForm";

const FREQUENCY_OPTIONS = [
  { value: "", label: "Please select..." },
  { value: "Weekly", label: "Weekly" },
  { value: "Fortnightly", label: "Fortnightly" },
  { value: "Ad Hoc", label: "Ad Hoc" },
  { value: "Special Event (once off)", label: "Special Event (once off)" },
];

const CHANGE_AMOUNT_OPTIONS = [
  { value: "", label: "Select Amount:" },
  { value: "$0 - $1000", label: "$0 - $1000" },
  { value: "$1000 - $5000", label: "$1000 - $5000" },
  { value: "$5000 - $20,000", label: "$5000 - $20,000" },
  { value: "$20,000 - $50,000", label: "$20,000 - $50,000" },
  { value: "over $50,000", label: "over $50,000" },
];

const CHANGE_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
  "Ad Hoc",
  "Banking",
];

const DAYS_OPTIONS = CHANGE_DAYS.map((day) => ({ label: day, value: day }));

const CHANGE_FIELDS: FieldConfig<QuoteFormData>[] = [
  {
    name: "ChangeFrequency",
    type: "select",
    label: "Frequency for change?",
    Icon: FaCalendarAlt,
    options: FREQUENCY_OPTIONS,
  },
  {
    name: "ChangeNotesAmount",
    type: "select",
    label: "Average notes value?",
    Icon: FaMoneyBillAlt,
    options: CHANGE_AMOUNT_OPTIONS,
  },
  {
    name: "ChangeCoinsAmount",
    type: "text",
    label: "Average coins value?",
    placeholder: "Enter amount",
    Icon: FaMoneyBillAlt,
    Icon2: FaDollarSign,
  },
  {
    name: "ChangeDays",
    type: "checkbox-group",
    label: "Usual day/s for delivery?",
    options: DAYS_OPTIONS,
    variant: "grid",
  },
  {
    name: "ChangeComments",
    type: "textarea",
    label: "Comments",
    placeholder: "Anything else you would like us to know?",
    rows: 3,
  },
];

interface ChangeStepProps {
  formManager: QuoteFormManager;
  theme?: ThemeType;
}

const ChangeStep = ({ formManager, theme = "dark" }: ChangeStepProps) => (
  <div className="form-page change">
    <StepHeading title="Change" as="h3" size="sm" />

    <div className="form-tab 480px:w-[90%] mx-auto">
      <FormFieldList
        fields={CHANGE_FIELDS}
        formManager={formManager}
        theme={theme}
      />
    </div>
  </div>
);

export default ChangeStep;
