import UniversalFormField from "@/components/form/UniversalFormField";
import {
  FaCircle,
  FaFileSignature,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";
import type { IcaAgreementData } from "../IcaAgreementClauses";
import IcaContractorClauses from "../IcaAgreementClauses";
import type { IcaFormManager } from "../IcaForm";
import IcaSectionTitle from "./IcaSectionTitle";

interface DeedOfGuaranteeSectionProps {
  formManager: IcaFormManager;
  deedOfGuaranteeData: IcaAgreementData;
  COMPANY_INFO: {
    name: string;
    address: string;
  };
}

const DeedOfGuaranteeSection = ({
  formManager,
  deedOfGuaranteeData,
  COMPANY_INFO,
}: DeedOfGuaranteeSectionProps) => (
  <div className="space-y-6 border-b border-dark-border/30 pb-12">
    <IcaSectionTitle Icon={FaFileSignature}>Deed of Guarantee</IcaSectionTitle>

    <p className="text-gray-700">
      THIS DEED is made on the day at item 1 of the Schedule
    </p>

    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-800">Recitals:</h4>

      <ul className="text-base text-gray-600 space-y-4 list-inside bg-[rgb(242,242,242,0.9)] p-4 rounded-lg">
        <li className="relative">
          <FaCircle className="text-primary text-[8px] mr-3 flex-shrink-0 absolute top-2" />
          <p className="pl-4">
            The Beneficiary at item 2 of the Schedule has agreed to engage the
            Contractor at item 3 of the Schedule as in the capacity of
            independent contractor.
          </p>
        </li>
        <li className="relative">
          <FaCircle className="text-primary text-[8px] mr-3 flex-shrink-0 absolute top-2" />
          <p className="pl-4">
            The Guarantor at item 4 of the Schedule agrees to guarantee the
            performances by the Contractor of its duties as independent
            contractor in the terms of an agreement in writing on the
            Beneficiaries website at item 5 of the Schedule (the
            &apos;Duties&apos; and &apos;Duty&apos; in the case of any
            individual duty within the Duties, as the context requires)
          </p>
        </li>
        <li className="relative">
          <FaCircle className="text-primary text-[8px] mr-3 flex-shrink-0 absolute top-2" />
          <p className="pl-4">
            In consideration of the Guarantor entering into this deed with the
            Beneficiary, the Beneficiary agrees to engage and or continue to
            engage the Contractor as independent contractor.
          </p>
        </li>
      </ul>
    </div>

    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-800">Clauses:</h4>
      <IcaContractorClauses data={deedOfGuaranteeData} />

      <div className="relative flex flex-col h-full justify-between">
        <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
          Date of Deed
        </label>
        <UniversalFormField
          {...formManager.getFieldProps({
            name: "DateDeed",
            type: "date",
            dayPlaceholder: "DD",
            monthPlaceholder: "MM",
            yearPlaceholder: "YYYY",
            format: "dd/MM/yyyy",
          })}
          theme="ica"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">Beneficiary:</h4>
        <div className="bg-[rgb(242,242,242,0.9)] p-4 rounded-lg">
          <p className="text-gray-700">
            {COMPANY_INFO.name.toUpperCase()} of <br />
            {COMPANY_INFO.address}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-gray-800">Guarantors:</h4>

        <div className="relative flex flex-col h-full justify-between">
          <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
            What is your full name?
          </label>
          <UniversalFormField
            {...formManager.getFieldProps({
              name: "NameConfirm",
              type: "text",
              placeholder: "Your Full Name",
              Icon: FaUser,
            })}
            theme="ica"
          />
        </div>

        <div className="relative flex flex-col h-full justify-between">
          <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
            Please enter your residential address here:
          </label>
          <UniversalFormField
            {...formManager.getFieldProps({
              name: "AddressResidential",
              type: "text",
              placeholder: "Your Physical Address",
              Icon: FaMapMarkerAlt,
            })}
            theme="ica"
          />
        </div>

        <div className="relative flex flex-col h-full justify-between">
          <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
            Please upload any government photo ID unique to yourself, i.e.
            drivers license.
          </label>
          <UniversalFormField
            {...formManager.getFieldProps({
              name: "GovernmentID",
              type: "file",
              accept: "image/*",
            })}
            fileUploadState={formManager.fileUpload}
            theme="ica"
          />
        </div>
      </div>
    </div>
  </div>
);

export default DeedOfGuaranteeSection;
