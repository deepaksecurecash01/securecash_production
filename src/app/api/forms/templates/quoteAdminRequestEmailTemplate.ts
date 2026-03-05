import { emailRow, emailSection, emailWrapper } from "../utils/emailLayout";

interface QuoteFormData {
  Name?: string;
  Organisation?: string;
  Phone?: string;
  Referrer?: string;
  Email?: string;
  Address?: string;
  Locations?: string;
  Service?: string[];
  BankingFrequency?: string;
  BankingAmount?: string;
  BankingBank?: string;
  BankingDays?: string[];
  BankingComments?: string;
  ChangeFrequency?: string;
  ChangeNotesAmount?: string;
  ChangeCoinsAmount?: string;
  ChangeDays?: string[];
  ChangeComments?: string;
}

const hasBankingData = (formData: QuoteFormData): boolean =>
  (
    [
      "BankingFrequency",
      "BankingAmount",
      "BankingBank",
      "BankingDays",
      "BankingComments",
    ] as const
  ).some((field) => {
    const value = formData[field];
    return (
      value && String(value).trim() !== "" && String(value) !== "Not specified"
    );
  });

const hasChangeData = (formData: QuoteFormData): boolean =>
  (
    [
      "ChangeFrequency",
      "ChangeNotesAmount",
      "ChangeCoinsAmount",
      "ChangeDays",
      "ChangeComments",
    ] as const
  ).some((field) => {
    const value = formData[field];
    return (
      value && String(value).trim() !== "" && String(value) !== "Not specified"
    );
  });

const bankingSection = (formData: QuoteFormData): string =>
  emailSection(
    "Banking",
    `
    <table>
      ${emailRow("Frequency", formData.BankingFrequency ?? "Not specified")}
      ${emailRow("Amount", formData.BankingAmount ?? "Not specified")}
      ${emailRow("Bank", formData.BankingBank ?? "Not specified")}
      ${emailRow("Days", String(formData.BankingDays ?? "Not specified"))}
      ${emailRow("Comments", formData.BankingComments ?? "Not specified")}
    </table>
  `,
  );

const changeSection = (formData: QuoteFormData): string =>
  emailSection(
    "Change",
    `
    <table>
      ${emailRow("Frequency", formData.ChangeFrequency ?? "Not specified")}
      ${emailRow("Avg. Notes Value", formData.ChangeNotesAmount ?? "Not specified")}
      ${emailRow("Avg. Coins Value", formData.ChangeCoinsAmount ?? "Not specified")}
      ${emailRow("Days", String(formData.ChangeDays ?? "Not specified"))}
      ${emailRow("Comments", formData.ChangeComments ?? "Not specified")}
    </table>
  `,
  );

const quoteAdminRequestEmailTemplate = (formData: QuoteFormData): string => {
  const services = formData.Service ?? [];
  const conditionalSections = [
    services.includes("Banking") && hasBankingData(formData)
      ? bankingSection(formData)
      : "",
    services.includes("Change") && hasChangeData(formData)
      ? changeSection(formData)
      : "",
  ].join("");

  return emailWrapper(
    "SecureCash Online Quote",
    `
    <h1 style="font-size:24px;font-weight:bold;">Quotation Request</h1>
    <p>A website visitor submitted the following details for a quote:</p>
    <table>
      ${emailRow("Name", formData.Name ?? "Not specified")}
      ${emailRow("Organisation", formData.Organisation ?? "Not specified")}
      ${emailRow("Phone #", formData.Phone ?? "Not specified")}
      ${emailRow("Heard from us", formData.Referrer ?? "Not specified")}
      ${emailRow("Email", formData.Email ?? "Not specified")}
      ${emailRow("Address", formData.Address ?? "Not specified")}
      ${emailRow("Locations", formData.Locations ?? "Not specified")}
    </table>
    ${conditionalSections}
  `,
  );
};

export default quoteAdminRequestEmailTemplate;
