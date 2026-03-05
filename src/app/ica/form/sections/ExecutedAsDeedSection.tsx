import UniversalFormField from "@/components/form/UniversalFormField";
import {
  FaBuilding,
  FaFileContract,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";
import type { IcaFormManager } from "../IcaForm";
import IcaSectionTitle from "./IcaSectionTitle";

interface ExecutedAsDeedSectionProps {
  formManager: IcaFormManager;
}

const ExecutedAsDeedSection = ({ formManager }: ExecutedAsDeedSectionProps) => (
  <div className="space-y-6 border-b border-dark-border/30 pb-12">
    <IcaSectionTitle Icon={FaFileContract}>Executed As A Deed</IcaSectionTitle>

    <div className="bg-[rgb(242,242,242,0.9)] p-6 rounded-lg">
      <p className="text-sm text-gray-700 mb-4 font-medium">
        SIGNED, SEALED and DELIVERED by:
      </p>

      <div className="relative flex flex-col h-full justify-between">
        <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
          Please enter your business/company name:
        </label>
        <UniversalFormField
          {...formManager.getFieldProps({
            name: "BusinessName",
            type: "text",
            placeholder: "Your Business or Company Name",
            Icon: FaBuilding,
          })}
          theme="ica"
        />
      </div>

      <p className="text-xs text-gray-600 mt-4">
        In accordance with its Constitution (if any) as a deed pursuant to
        section 127 of the Corporations Act.
      </p>
    </div>

    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-800">Witness:</h4>
      <p className="text-sm text-gray-600">
        Please provide the details to a person over the age of 18 that can
        witness you completing the required information and authorising this
        Deed of Guarantee:
      </p>

      <div className="relative flex flex-col h-full justify-between">
        <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
          Full name of the witness:
        </label>
        <UniversalFormField
          {...formManager.getFieldProps({
            name: "WitnessName",
            type: "text",
            placeholder: "Your Witness's Name",
            Icon: FaUser,
          })}
          theme="ica"
        />
      </div>

      <div className="relative flex flex-col h-full justify-between">
        <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
          Please enter the residential address of the witness:
        </label>
        <UniversalFormField
          {...formManager.getFieldProps({
            name: "WitnessAddress",
            type: "text",
            placeholder: "Your Witness's Address",
            Icon: FaMapMarkerAlt,
          })}
          theme="ica"
        />
      </div>

      <div className="relative flex flex-col h-full justify-between">
        <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
          Please upload any government ID unique to the witness (e.g.
          driver&apos;s license):
        </label>
        <UniversalFormField
          {...formManager.getFieldProps({
            name: "WitnessID",
            type: "file",
            accept: "image/*",
          })}
          fileUploadState={formManager.fileUpload}
          theme="ica"
        />
      </div>
    </div>
  </div>
);

export default ExecutedAsDeedSection;
