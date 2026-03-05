import type { FieldConfig } from "@/components/form/FieldRenderer";
import { ThemeType } from "@/components/form/inputs/themes";
import FormFieldList from "@/components/form/utils/core/FormFieldList";
import StepHeading from "@/components/form/utils/core/StepHeading";
import { QuoteFormData } from "@/zod/QuoteFormSchema";
import { FaCalendarAlt, FaMoneyBillAlt, FaUniversity } from "react-icons/fa";
import type { QuoteFormManager } from "../QuoteForm";

const FREQUENCY_OPTIONS = [
  { value: "", label: "Please select..." },
  { value: "Weekly", label: "Weekly" },
  { value: "Fortnightly", label: "Fortnightly" },
  { value: "Ad Hoc", label: "Ad Hoc" },
  { value: "Special Event (once off)", label: "Special Event (once off)" },
];

const BANKING_AMOUNT_OPTIONS = [
  { value: "", label: "Select Amount:" },
  { value: "$0 - $5000", label: "$0 - $5000" },
  { value: "$5000 - $20,000", label: "$5000 - $20,000" },
  { value: "$20,000 - $40,000", label: "$20,000 - $40,000" },
  { value: "$40,000 - $50,000", label: "$40,000 - $50,000" },
  { value: "over $50,000", label: "over $50,000" },
];

const BANKING_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
  "Ad Hoc",
];

const DAYS_OPTIONS = BANKING_DAYS.map((day) => ({ label: day, value: day }));

const BANKING_FIELDS: FieldConfig<QuoteFormData>[] = [
  {
    name: "BankingFrequency",
    type: "select",
    label: "Collection Frequency",
    Icon: FaCalendarAlt,
    options: FREQUENCY_OPTIONS,
  },
  {
    name: "BankingAmount",
    type: "select",
    label: "Average Collection Amount",
    Icon: FaMoneyBillAlt,
    options: BANKING_AMOUNT_OPTIONS,
  },
  {
    name: "BankingBank",
    type: "text",
    label: "Who Do You Bank With?",
    placeholder: "Who do you bank with?",
    Icon: FaUniversity,
  },
  {
    name: "BankingDays",
    type: "checkbox-group",
    label: "Usual day/s for collection?",
    options: DAYS_OPTIONS,
    variant: "grid",
  },
  {
    name: "BankingComments",
    type: "textarea",
    label: "Comments",
    placeholder: "Anything else you would like us to know?",
    rows: 3,
  },
];

interface BankingStepProps {
  formManager: QuoteFormManager;
  theme?: ThemeType;
}

const BankingStep = ({ formManager, theme = "dark" }: BankingStepProps) => (
  <div className="form-page banking">
    <StepHeading title="Banking" as="h3" size="sm" />
    <div className="form-tab 480px:w-[90%] mx-auto">
      <FormFieldList
        fields={BANKING_FIELDS}
        formManager={formManager}
        theme={theme}
      />
    </div>
  </div>
);

export default BankingStep;
