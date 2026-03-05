import { emailRow, emailWrapper } from "../utils/emailLayout";

interface AustracFormData {
  Organisation?: string;
  ABN?: string;
  Website?: string;
  OrganisationEmail?: string;
  OrganisationType?: string;
  Address?: string;
  State?: string;
  Personnel?: string;
  "IP Address"?: string;
  Device?: string;
  dateOfSubmission?: string;
}

const austracSubmissionEmailTemplate = (
  formData: AustracFormData,
  currentDateTime: string,
): string =>
  emailWrapper(
    "AUSTRAC",
    `
    <h1 style="font-size:24px;font-weight:bold;">AUSTRAC Information</h1>
    <p>Thank you for telling us a bit more about your organisation!</p>
    <p>The following details were submitted through our AUSTRAC form:</p>
    <table>
      ${emailRow("Organisation", formData.Organisation ?? "")}
      ${emailRow("ABN", formData.ABN ?? "")}
      ${emailRow("Main Website", formData.Website ?? "")}
      ${emailRow("Main Email", formData.OrganisationEmail ?? "")}
      ${emailRow("Organisation Type", formData.OrganisationType ?? "")}
      ${emailRow("Address", formData.Address ?? "")}
      ${emailRow("State", formData.State ?? "")}
      ${emailRow("Personnel", formData.Personnel ?? "")}
      ${emailRow("IP Address", formData["IP Address"] ?? "")}
      ${emailRow("Device", formData.Device ?? "")}
      ${emailRow("Date of Submission", formData.dateOfSubmission ?? currentDateTime)}
    </table>
  `,
  );

export default austracSubmissionEmailTemplate;
