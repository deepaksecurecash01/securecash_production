import { FormData } from "../services/emailService";
import { emailWrapper } from "../utils/emailLayout";

const siteInfoUserConfirmationEmailTemplate = (formData: FormData): string =>
  emailWrapper(
    "SecureCash Welcome Form",
    `
    <p>Hi ${formData.Contact ?? "there"},</p>
    <p>Thank you for taking the time to fill out our Welcome forms. All details have been received.</p>
    <p>Soon, a member of our team will be in touch with the person you nominated to be your Site contact.
      They will make sure everything is ready to begin services.</p>
    <p><strong>If your services include banking collections, please ensure you have express deposit bags
      and deposit slips from your bank. These are essential for your collections.</strong></p>
    <p>Below we have added some information about how to prepare your banking,
      and also how our electronic services work.</p>
    <p>For any questions, please feel free to call 1300 SECURE (1300 732 873),
      or email customers@securecash.com.au.</p>
    <p>We look forward to working with you.</p>
    <p>Kind regards<br>The team at SecureCash</p>
  `,
  );

export default siteInfoUserConfirmationEmailTemplate;
