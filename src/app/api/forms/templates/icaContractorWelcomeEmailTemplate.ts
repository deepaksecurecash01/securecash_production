import { FormData } from "../services/emailService";
import {
  emailRow,
  emailSection,
  emailWrapper,
  LOGO,
} from "../utils/emailLayout";

const icaContractorWelcomeEmailTemplate = (formData: FormData): string =>
  emailWrapper(
    "Independent Contractors Agreement",
    `
    <h1 style="font-size:24px;font-weight:bold;line-height:150%;">
      Welcome, and thank you for joining our network!
    </h1>
    <p><strong>Please note the following important information:</strong></p>

    <h3>Invoices</h3>
    <ul>
      <li>Please send at the end of the month, NO weekly accounts,</li>
      <li>All invoices are to be made out to Office Central Pty Ltd ACN 668 461 050,</li>
      <li>All invoices must be emailed to <a href="mailto:accounts@securecash.com.au">accounts@securecash.com.au</a>,</li>
      <li>Please make sure you itemise the services for the month so the client can be billed correctly.</li>
    </ul>

    <h3>Keys</h3>
    <p>Unless we have issued you with a key/s, <strong style="text-decoration:underline;">DO NOT</strong>
      accept any further keys from the clients.</p>
    <p>Contact us immediately if a client requests you to keep a key in order to provide their services.</p>

    <h3>Change Orders</h3>
    <p>All clients are contracted to order their change from SecureCash only via the
      <a href="https://service.securecash.com.au/">SecureCash online services website</a>
      or by telephoning SecureCash direct on 1300 732 873.</p>
    <p>These change orders will be forwarded to you via email in real time as lodged by the clients.</p>
    <p>Do not accept any change orders from clients that have not been ordered through SecureCash prior
      to your couriers arrival as you will not be paid for any orders that did not come through either
      method above.</p>

    <h3>Collection Days</h3>
    <p>If one of the clients wants to change collection days, then they must do so by using the
      <a href="https://service.securecash.com.au/">SecureCash online services website</a>
      or by telephoning SecureCash direct on 1300 732 873.</p>
    <p>Contact will be made to your business to confirm if the change of day/s requested are available
      prior to confirming with the client.</p>

    <h3>Your Contact</h3>
    <p>Your direct contact with Office Central Pty Ltd will be Drex Aradilla.</p>
    <p>Our Operations Department can be contacted on 1300 SECURE, their email address is:
      <a href="mailto:operations@securecash.com.au">operations@securecash.com.au</a></p>

    ${emailSection(
      "Independent Contractors Agreement",
      `
      <p>Please see below for a brief summary of the information you submitted.
        The agreement and the deed are attached to this email as PDF copies.</p>
      <table style="margin-left:8px;">
        ${emailRow("Full Name", String(formData.FullName ?? formData.CompanyName ?? ""))}
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
      "Schedule of The Deed",
      `
      <table style="margin-left:8px;">
        ${emailRow("Date of Deed", String(formData.DateDeed ?? ""))}
        ${emailRow("Beneficiary", "Office Central Pty Ltd ACN 668 461 050 of 30 Church Hill Road, Old Noarlunga, SA")}
        ${emailRow("Contractor", String(formData.BusinessName ?? formData.CompanyName ?? ""))}
        ${emailRow("Guarantor", `${String(formData.NameConfirm ?? formData.CompanyName ?? "")} of ${String(formData.AddressResidential ?? "")}`)}
        ${emailRow("Name", String(formData.FullName ?? formData.CompanyName ?? ""))}
        ${emailRow("Residential Address", String(formData.AddressResidential ?? ""))}
        ${emailRow("Witnessed by", String(formData.WitnessName ?? ""))}
        ${emailRow("Witness Address", String(formData.WitnessAddress ?? ""))}
      </table>
    `,
    )}
  `,
    { logo: LOGO.edockets },
  );

export default icaContractorWelcomeEmailTemplate;
