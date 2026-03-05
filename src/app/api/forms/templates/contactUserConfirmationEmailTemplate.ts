import { emailWrapper } from "../utils/emailLayout";

const contactUserConfirmationEmailTemplate = (): string =>
  emailWrapper(
    "SecureCash Contact Request",
    `
    <p>Hi,</p>
    <p>Thank you for contacting SecureCash!</p>
    <p>Your email has been received, and we will be in touch with you shortly.</p>
    <p>If we can be of any assistance in the meantime, then please do not hesitate to call us on
      <a href="tel:1300732873">1300 SECURE</a> (1300 732 873), or simply reply to this email.</p>
    <p>Kind regards,</p>
    <p><strong>The SecureCash Customer Service Team</strong></p>
    <p>
      Email: <a href="mailto:customers@securecash.com.au">customers@securecash.com.au</a><br>
      Phone: <a href="tel:1300732873">1300 SECURE</a>
    </p>
  `,
  );

export default contactUserConfirmationEmailTemplate;
