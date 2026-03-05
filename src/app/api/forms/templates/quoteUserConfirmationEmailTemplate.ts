import { emailWrapper } from "../utils/emailLayout";

const quoteUserConfirmationEmailTemplate = (): string =>
  emailWrapper(
    "SecureCash Online Quote",
    `
    <p>Hi,</p>
    <p>Thank you for taking the time to request a quote from SecureCash!</p>
    <p>Your information has been received and we will get working on a quote for you straight away!</p>
    <p>If in the meantime you need to provide us with any further information, then please feel free
      to contact me on 0433 251 983, or reply to this email.</p>
    <p>Thanks again and I will be in touch soon.</p>
    <p>Kind regards,</p>
    <p>
      <strong>Beth Bacchus<br>Chief Business Officer</strong>
    </p>
    <p>
      Email: <a href="mailto:sales@securecash.com.au">sales@securecash.com.au</a><br>
      Mobile: <a href="tel:0433251983">0433 251 983</a>
    </p>
  `,
  );

export default quoteUserConfirmationEmailTemplate;
