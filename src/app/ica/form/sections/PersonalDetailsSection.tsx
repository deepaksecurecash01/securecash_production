import type { FieldConfig } from "@/components/form/FieldRenderer";
import UniversalFormField from "@/components/form/UniversalFormField";
import type { IcaFormData } from "@/zod/IcaFormSchema";
import {
  FaBuilding,
  FaEnvelope,
  FaIdCard,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import type { IcaFormManager } from "../IcaForm";
import IcaSectionTitle from "./IcaSectionTitle";

const ORGANIZATION_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Please Select" },
  { value: "Individual (Sole Trader)", label: "Individual (Sole Trader)" },
  { value: "Trustees & Beneficiaries", label: "Trustees & Beneficiaries" },
  {
    value: "Domestic Pty Ltd or Ltd Company",
    label: "Domestic Pty Ltd or Ltd Company",
  },
  { value: "Registered Foreign Company", label: "Registered Foreign Company" },
  {
    value: "Foreign Company Not Registered in Australia",
    label: "Foreign Company Not Registered in Australia",
  },
  { value: "Partners & Partnerships", label: "Partners & Partnerships" },
  { value: "Associations", label: "Associations" },
  { value: "Registered Co-Operatives", label: "Registered Co-Operatives" },
  { value: "Government Body", label: "Government Body" },
  {
    value: "School or Education Institute",
    label: "School or Education Institute",
  },
  {
    value: "Church or Religious Organisation",
    label: "Church or Religious Organisation",
  },
];

const CONTACT_GRID_FIELDS: FieldConfig<IcaFormData>[] = [
  {
    name: "ABN",
    type: "abn",
    label: "What is your ABN number?",
    placeholder: "Your ABN Number",
    Icon: FaIdCard,
  },
  {
    name: "Phone",
    type: "tel",
    label: "What is your best contact number?",
    placeholder: "Your Phone Number",
    Icon: FaPhone,
  },
  {
    name: "Email",
    type: "email",
    label: "What is your email address?",
    placeholder: "Your Email Address",
    Icon: FaEnvelope,
  },
];

const PersonalDetailsSection = ({
  formManager,
}: {
  formManager: IcaFormManager;
}) => (
  <div className="space-y-6 border-b border-dark-border/30 pb-12">
    <IcaSectionTitle Icon={FaUser}>Personal Details</IcaSectionTitle>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LEFT COLUMN */}
      <div className="relative flex flex-col h-full justify-between">
        <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
          What is your full name?
        </label>
        <UniversalFormField
          {...formManager.getFieldProps({
            name: "FullName",
            type: "text",
            placeholder: "Your Full Name",
            Icon: FaUser,
          })}
          theme="ica"
        />
      </div>

      {/* RIGHT COLUMN */}
      <div className="relative flex flex-col h-full justify-between">
        <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
          What is the organisation structure type?
        </label>
        <UniversalFormField
          {...formManager.getFieldProps({
            name: "OrganisationType",
            type: "select",
            options: ORGANIZATION_OPTIONS,
            Icon: FaBuilding,
          })}
          theme="ica"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 768px:grid-cols-2 1024px:grid-cols-3 gap-6">
      {CONTACT_GRID_FIELDS.map((field) => (
        <div
          key={field.name}
          className="relative flex flex-col h-full justify-between"
        >
          <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
            {field.label}
          </label>
          <UniversalFormField
            {...formManager.getFieldProps(field)}
            theme="ica"
          />
        </div>
      ))}
    </div>

    <div className="bg-dark-border/90 p-4 rounded-lg">
      <p className="text-sm text-white">
        <FaInfoCircle className="inline mr-2" />A copy of this agreement will be
        sent to the address provided.
      </p>
    </div>

    <div className="space-y-6">
      <div className="relative flex flex-col h-full justify-between">
        <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
          What is your physical address?
        </label>
        <UniversalFormField
          {...formManager.getFieldProps({
            name: "Address",
            type: "text",
            placeholder: "Your Physical Address",
            Icon: FaMapMarkerAlt,
          })}
          theme="ica"
        />
      </div>

      <div className="relative flex flex-col h-full justify-between">
        <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
          What is your postal address?
        </label>
        <UniversalFormField
          {...formManager.getFieldProps({
            name: "AddressPostal",
            type: "text",
            placeholder: "Your Postal Address",
            Icon: FaMapMarkerAlt,
          })}
          theme="ica"
        />
      </div>
    </div>
  </div>
);

export default PersonalDetailsSection;
