import UniversalFormField from "@/components/form/UniversalFormField";
import { FaShieldAlt } from "react-icons/fa";
import type { IcaFormManager } from "../IcaForm";
import IcaSectionTitle from "./IcaSectionTitle";

interface LicensingInsuranceSectionProps {
  formManager: IcaFormManager;
}

const LicensingInsuranceSection = ({
  formManager,
}: LicensingInsuranceSectionProps) => (
  <div className="space-y-6 border-b border-dark-border/30 pb-12">
    <IcaSectionTitle Icon={FaShieldAlt}>Licensing & Insurance</IcaSectionTitle>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LEFT COLUMN */}
      <div className="relative flex flex-col h-full justify-between">
        <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
          Please upload a copy of your Security or Masters License:
        </label>
        <UniversalFormField
          {...formManager.getFieldProps({
            name: "SecurityLicense",
            type: "file",
            accept: "image/*,.pdf",
          })}
          fileUploadState={formManager.fileUpload}
          theme="ica"
        />
      </div>

      {/* RIGHT COLUMN */}
      <div className="relative flex flex-col h-full justify-between">
        <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
          Please upload a copy of your cash in transit insurance:
        </label>
        <UniversalFormField
          {...formManager.getFieldProps({
            name: "CITInsurance",
            type: "file",
            accept: "image/*,.pdf",
          })}
          fileUploadState={formManager.fileUpload}
          theme="ica"
        />
      </div>
    </div>
  </div>
);

export default LicensingInsuranceSection;
