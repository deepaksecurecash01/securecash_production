import UniversalFormField from "@/components/form/UniversalFormField";
import { FaCalendarAlt } from "react-icons/fa";
import type { IcaAgreementData } from "../IcaAgreementClauses";
import IcaContractorClauses from "../IcaAgreementClauses";
import type { IcaFormManager } from "../IcaForm";
import IcaSectionTitle from "./IcaSectionTitle";

interface AgreementTermSectionProps {
  formManager: IcaFormManager;
  agreementTermData: IcaAgreementData;
}

const AgreementTermSection = ({
  formManager,
  agreementTermData,
}: AgreementTermSectionProps) => (
  <div className="space-y-6 border-b border-dark-border/30 pb-12">
    <IcaSectionTitle Icon={FaCalendarAlt}>Agreement Term</IcaSectionTitle>

    <div className="relative flex flex-col h-full justify-between">
      <label className="text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0">
        This agreement will commence on the?
      </label>
      <UniversalFormField
        {...formManager.getFieldProps({
          name: "DateCommencement",
          type: "date",
          dayPlaceholder: "DD",
          monthPlaceholder: "MM",
          yearPlaceholder: "YYYY",
          format: "dd/MM/yyyy",
        })}
        theme="ica"
      />
    </div>

    <p className="text-gray-700">
      And will be ongoing unless either party terminates this Agreement in
      accordance with the termination provisions herein (&quot;Expiry&quot;).
    </p>

    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-800">The Agreement</h4>
      <IcaContractorClauses data={agreementTermData} />

      <div className="relative flex flex-col h-full justify-between">
        <UniversalFormField
          {...formManager.getFieldProps({
            name: "AcceptAgreement",
            type: "checkbox-group",
            options: [
              {
                value: "accepted",
                label: "I understand and accept the terms of this agreement.",
              },
            ],
            variant: "agreement",
          })}
          theme="ica"
        />
      </div>
    </div>
  </div>
);

export default AgreementTermSection;
