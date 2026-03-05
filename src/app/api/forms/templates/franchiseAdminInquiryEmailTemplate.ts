import { emailRow, emailWrapper } from "../utils/emailLayout";

interface FranchiseFormData {
  ReferralSource?: string;
  ReferralSourceOther?: string;
  FullName?: string;
  Email?: string;
  Phone?: string;
  Address?: string;
  InterestedArea?: string;
  ReasonForInterest?: string;
}

const franchiseAdminInquiryEmailTemplate = (
  formData: FranchiseFormData,
): string => {
  const referralDisplay =
    formData.ReferralSource === "Other"
      ? formData.ReferralSourceOther
        ? `Other - ${formData.ReferralSourceOther}`
        : "Other (not specified)"
      : (formData.ReferralSource ?? "");

  return emailWrapper(
    "SecureCash Franchise Expression of Interest",
    `
    <h1 style="font-size:24px;font-weight:bold;">Franchise Expression of Interest</h1>
    <p>A website visitor submitted the following details through the
      <strong>Franchise Expression of Interest form</strong>:</p>
    <table>
      ${emailRow("Name", formData.FullName ?? "")}
      ${emailRow("Phone #", formData.Phone ?? "")}
      ${emailRow("Email", formData.Email ?? "")}
      ${emailRow("Postal Address", formData.Address ?? "")}
      ${emailRow("Territory", formData.InterestedArea ?? "")}
      ${emailRow("Message", formData.ReasonForInterest ?? "")}
      ${emailRow("Referral Source", referralDisplay)}
    </table>
  `,
    { footerEmail: "franchise@securecash.com.au" },
  );
};

export default franchiseAdminInquiryEmailTemplate;
