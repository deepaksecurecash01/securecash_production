import { emailRow, emailWrapper } from "../utils/emailLayout";

interface TermsFormData {
  "Organisation Name"?: string;
  "Organisation Role"?: string;
  "Organisation ABN"?: string;
  "Full Name"?: string;
  Birthday?: string;
  Email?: string;
  "IP Address"?: string;
  Device?: string;
  "Date of Acceptance"?: string;
}

const termsAgreementEmailTemplate = (
  formData: TermsFormData,
  _agreementCommencementDate: string,
): string =>
  emailWrapper(
    "Terms &amp; Conditions",
    `
    <h1 style="font-size:24px;font-weight:bold;">Our Terms &amp; Conditions</h1>
    <p>Thank you for accepting our Terms &amp; Conditions!</p>
    <p>The following details were submitted through our Terms &amp; Conditions form:</p>
    <table>
      ${emailRow("Organisation Name", formData["Organisation Name"] ?? "")}
      ${emailRow("Organisation Role", formData["Organisation Role"] ?? "")}
      ${emailRow("Organisation ABN", formData["Organisation ABN"] ?? "")}
      ${emailRow("Full Name", formData["Full Name"] ?? "")}
      ${emailRow("Birthday", formData.Birthday ?? "")}
      ${emailRow("Email", formData.Email ?? "")}
      ${emailRow("IP Address", formData["IP Address"] ?? "")}
      ${emailRow("Device", formData.Device ?? "")}
      ${emailRow("Date of Acceptance", formData["Date of Acceptance"] ?? "")}
    </table>

    <h2 style="font-size:20px;font-weight:bold;margin-bottom:20px;">Service Agreement</h2>

    <h3 style="font-size:16px;font-weight:bold;text-transform:uppercase;margin-bottom:10px;">PARTIES</h3>

    <p style="margin-bottom:5px;font-weight:bold;font-size:16px;">Principal</p>
    <p style="margin-top:0;margin-bottom:20px;">
      Sky Wallet Pty Ltd<br>ABN 39 668 299 027<br>
      30 Church Hill Road, Old Noarlunga SA 5168<br>
      Trading under licence as <strong>SecureCash</strong><br>
      (including its permitted contractors, franchisees, agents and assigns) (<strong>Principal</strong>)
    </p>

    <p style="margin-bottom:5px;font-weight:bold;font-size:16px;">Customer</p>
    <p style="margin-top:0;margin-bottom:20px;">
      ${formData["Full Name"] ?? ""} (${formData["Organisation Role"] ?? ""}) of
      ${formData["Organisation Name"] ?? ""} ABN ${formData["Organisation ABN"] ?? ""}
      (<strong>Customer</strong>)
    </p>

    <h3 style="font-size:16px;font-weight:bold;text-transform:uppercase;margin-bottom:10px;">COMMENCEMENT AND TERM</h3>
    <p style="margin-top:0;margin-bottom:10px;">
      This Agreement commences on the date the Customer accepts these Terms and continues
      until terminated in accordance with this Agreement.
    </p>
    <p style="margin-top:0;margin-bottom:20px;">
      Acceptance may occur by written signature, electronic acceptance, or continued use of the Services.
    </p>
    <p>Please see the attached <strong>SecureCash T's &amp; C's Agreement</strong> PDF
      which includes your signature and all submitted details.</p>
  `,
  );

export default termsAgreementEmailTemplate;
