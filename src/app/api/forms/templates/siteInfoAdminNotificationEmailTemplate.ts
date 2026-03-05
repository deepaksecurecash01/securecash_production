import { emailRow, emailWrapper } from "../utils/emailLayout";

interface SiteInfoFormData {
  BusinessName?: string;
  Address?: string;
  Suburb?: string;
  State?: string;
  Postcode?: string;
  Contact?: string;
  Position?: string;
  Phone?: string;
  Email?: string;
  Accounts?: string;
  Services?: string | string[];
  Dates?: string;
  Type?: string;
  Schedule?: string | string[];
  Bank?: string;
  Amount?: string;
  Parking?: string | string[];
  Security?: string | string[];
  External?: string | string[];
  Internal?: string | string[];
  "IP Address"?: string;
  Device?: string;
  dateOfSubmission?: string;
}

type FormatterFn = (field: string | string[] | null | undefined) => string;

const siteInfoAdminNotificationEmailTemplate = (
  formData: SiteInfoFormData,
  currentDateTime: string,
  formatArrayField: FormatterFn,
): string =>
  emailWrapper(
    "Site Info",
    `
    <h1 style="font-size:24px;font-weight:bold;">Business Information</h1>
    <p>The following details were submitted through our Site Info form:</p>
    <table>
      ${emailRow("Business Name", formData.BusinessName ?? "Not specified")}
      ${emailRow("Address", formData.Address ?? "Not specified")}
      ${emailRow("Suburb", formData.Suburb ?? "Not specified")}
      ${emailRow("State", formData.State ?? "Not specified")}
      ${emailRow("Postcode", formData.Postcode ?? "Not specified")}
    </table>

    <h1 style="font-size:24px;font-weight:bold;margin-top:24px;">Contacts</h1>
    <table>
      ${emailRow("Main Contact", formData.Contact ?? "Not specified")}
      ${emailRow("Position", formData.Position ?? "Not specified")}
      ${emailRow("Phone", formData.Phone ?? "Not specified")}
      ${emailRow("Email", formData.Email ?? "Not specified")}
      ${emailRow("Send Accounts To", formData.Accounts ?? "Not specified")}
    </table>

    <h1 style="font-size:24px;font-weight:bold;margin-top:24px;">Schedule</h1>
    <table>
      ${emailRow("Required Services", formatArrayField(formData.Services))}
      ${emailRow("Date/s", formData.Dates ?? "Not specified")}
      ${emailRow("Schedule", `<strong>${formData.Type ?? "Regular Service"}</strong><br>${formatArrayField(formData.Schedule)}`)}
      ${emailRow("Bank", formData.Bank ?? "Not specified")}
    </table>

    <h1 style="font-size:24px;font-weight:bold;margin-top:24px;">Hazards</h1>
    <table>
      ${emailRow("Avg. Collection", formData.Amount ?? "Not specified")}
      ${emailRow("Parking", formatArrayField(formData.Parking))}
      ${emailRow("Security", formatArrayField(formData.Security))}
      ${emailRow("External", formatArrayField(formData.External))}
      ${emailRow("Internal", formatArrayField(formData.Internal))}
    </table>

    <h1 style="font-size:24px;font-weight:bold;margin-top:24px;">Submitted By</h1>
    <table>
      ${emailRow("IP Address", formData["IP Address"] ?? "Not available")}
      ${emailRow("Device", formData.Device ?? "Not available")}
      ${emailRow("Date of Submission", formData.dateOfSubmission ?? currentDateTime)}
    </table>
  `,
  );

export default siteInfoAdminNotificationEmailTemplate;
