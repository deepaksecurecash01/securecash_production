import { emailRow, emailWrapper } from "../utils/emailLayout";

interface InductionFormData {
  FullName?: string;
  Phone?: string;
  Email?: string;
  Address?: string;
  State?: string;
  ContractorName?: string;
  EdocketUsername?: string;
  EdocketPassword?: string;
}

const inductionEmailTemplate = (
  formData: InductionFormData,
  currentDateTime: string,
): string =>
  emailWrapper(
    "Induction Completion Record",
    `
    <h1 style="font-size:24px;font-weight:bold;">Induction - ${formData.FullName ?? ""}</h1>
    <p>The following particulars were submitted upon successful completion of the induction:</p>
    <table>
      ${emailRow("Full Name", formData.FullName ?? "")}
      ${emailRow("Phone #", formData.Phone ?? "")}
      ${emailRow("Email", formData.Email ?? "")}
      ${emailRow("Address", formData.Address ?? "")}
      ${emailRow("State", formData.State ?? "")}
      ${emailRow("Contractor", formData.ContractorName ?? "")}
      ${emailRow(
        "eDocket Credentials",
        `<strong>User:</strong> ${formData.EdocketUsername ?? ""}<br>
         <strong>Pass:</strong> ${formData.EdocketPassword ?? ""}`,
      )}
      ${emailRow("Submitted", currentDateTime)}
    </table>
    <p style="margin-top:20px;font-size:13px;color:#666;">
      Note: Personal photo and drivers license are included as attachments to this email.
    </p>
  `,
    { footerEmail: "operations@securecash.com.au" },
  );

export default inductionEmailTemplate;
