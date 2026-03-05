import { emailRow, emailWrapper } from "../utils/emailLayout";

interface ContactFormData {
  FullName?: string;
  Email?: string;
  Phone?: string;
  Organisation?: string;
  Department?: string;
  Message?: string;
  ChkCallBack?: string;
  CallbackTime?: string;
  CallbackState?: string;
  "IP Address"?: string;
  Device?: string;
  dateOfSubmission?: string;
}

const contactAdminNotificationEmailTemplate = (
  formData: ContactFormData,
  currentDateTime: string,
  formattedCallbackDate: string,
): string => {
  const callbackSection = formData.ChkCallBack?.includes("Yes, please.")
    ? `
        <h1 style="font-size:24px;font-weight:bold;">Callback</h1>
        <table>
          ${emailRow("Date", formattedCallbackDate)}
          ${emailRow("Time", formData.CallbackTime ?? "Not specified")}
          ${emailRow("State", formData.CallbackState ?? "Not specified")}
        </table>
      `
    : "";

  return emailWrapper(
    "SecureCash Contact Request",
    `
    <h1 style="font-size:24px;font-weight:bold;">Contact Request</h1>
    <p>A website visitor submitted the following details through the contact form:</p>
    <table>
      ${emailRow("Sent To", `${formData.Department ?? ""}@securecash.com.au`)}
      ${emailRow("Name", formData.FullName ?? "")}
      ${emailRow("Organisation", formData.Organisation ?? "")}
      ${emailRow("Phone #", formData.Phone ?? "")}
      ${emailRow("Email", formData.Email ?? "")}
      ${emailRow("Message", formData.Message ?? "")}
      ${emailRow("IP Address", formData["IP Address"] ?? "Not available")}
      ${emailRow("Device", formData.Device ?? "Not available")}
      ${emailRow("Date of Submission", formData.dateOfSubmission ?? currentDateTime)}
    </table>
    ${callbackSection}
  `,
  );
};

export default contactAdminNotificationEmailTemplate;
