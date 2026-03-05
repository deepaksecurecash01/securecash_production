import { FormData } from "../services/emailService";
import {
  emailRow,
  emailSection,
  emailWrapper,
  LOGO,
} from "../utils/emailLayout";

const icaOperationsReviewEmailTemplate = (formData: FormData): string =>
  emailWrapper(
    "Independent Contractors Agreement",
    `
    <h1 style="font-size:24px;font-weight:bold;">Independent Contractors Agreement</h1>
    <p>The following details were submitted through the ICA form:</p>

    ${emailSection(
      "The Agreement",
      `
      <table style="margin-left:8px;">
        ${emailRow("Full Name", String(formData.Name ?? ""))}
        ${emailRow("Org. Structure", String(formData.OrganisationType ?? ""))}
        ${emailRow("ABN", String(formData.ABN ?? ""))}
        ${emailRow("Phone", String(formData.Phone ?? ""))}
        ${emailRow("Email", String(formData.Email ?? ""))}
        ${emailRow("Physical Address", String(formData.Address ?? ""))}
        ${emailRow("Postal Address", String(formData.AddressPostal ?? ""))}
        ${emailRow("Commencement", String(formData.DateCommencement ?? ""))}
      </table>
    `,
    )}

    ${emailSection(
      "The Deed",
      `
      <table style="margin-left:8px;">
        ${emailRow("Date of Deed", String(formData.DateDeed ?? ""))}
        ${emailRow("Guarantor's Name", String(formData.Name ?? ""))}
        ${emailRow("Residential Address", String(formData.AddressResidential ?? ""))}
        ${emailRow("Business Name", String(formData.BusinessName ?? ""))}
      </table>
      <p style="margin-left:8px;">* The Guarantor's government photo ID is attached to this email.</p>
    `,
    )}

    ${emailSection(
      "The Witness",
      `
      <table style="margin-left:8px;">
        ${emailRow("Witness's Name", String(formData.WitnessName ?? ""))}
        ${emailRow("Witness's Address", String(formData.WitnessAddress ?? ""))}
      </table>
      <p style="margin-left:8px;">* The Witness's government photo ID is attached to this email.</p>
    `,
    )}

    ${emailSection(
      "Licensing and Insurance",
      `
      <p style="margin-left:8px;">
        The Security or Masters License and CIT insurance are attached to this email.
      </p>
    `,
    )}

    ${emailSection(
      "eDockets Contractor Code",
      `
      <table style="margin-left:8px;">
        ${emailRow("Code", String(formData.eDocketsContractorCode ?? ""))}
      </table>
    `,
    )}
  `,
    { logo: LOGO.edockets },
  );

export default icaOperationsReviewEmailTemplate;
