import { emailWrapper } from "../utils/emailLayout";

const franchiseUserWelcomeEmailTemplate = (): string =>
  emailWrapper(
    "SecureCash Franchise Enquiry",
    `
    <p>Hi,</p>
    <p>Thank you for enquiring about a SecureCash Franchise!</p>
    <p>Your email has been received, and we will be in touch with you shortly.</p>
    <p>Below is attached some reading material for you to go through in the meantime,
      this includes the ACCC Information Statement which needs to be understood before proceeding.</p>
    <p>If we can be of any assistance in the meantime, then please do not hesitate to call us on
      <a href="tel:1300732873">1300 SECURE</a> (1300 732 873), or simply reply to this email.</p>
    <p>Kind regards,</p>
    <p><strong>The SecureCash Franchise Team</strong></p>
    <p>
      Email: <a href="mailto:franchise@securecash.com.au">franchise@securecash.com.au</a><br>
      Phone: <a href="tel:1300732873">1300 SECURE</a>
    </p>
  `,
    { footerEmail: "franchise@securecash.com.au" },
  );

export default franchiseUserWelcomeEmailTemplate;
