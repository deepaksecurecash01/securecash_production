import { emailWrapper, LOGO } from "../utils/emailLayout";

const icaEdocketsIntroductionEmailTemplate = (): string =>
  emailWrapper(
    "Say no to unnecessary paperwork!",
    `
    <h1 style="font-size:24px;font-weight:bold;line-height:150%;">
      Thank you for becoming part of the SecureCash network!
    </h1>
    <p>We have created an electronic docket application called eDockets and it's available
      for your business to use!</p>
    <p>We wanted to make our processes easier for both our customers and contractors while
      keeping things relevant and simple!</p>
    <p>SecureCash are a licensed reseller for our application and they want you to receive the
      same benefits they have from operating with this system.</p>
    <p>The process is simple — you turn up to the customers business, scan a couple of barcodes,
      get a signature and you're out. An email will be generated for record keeping and sent
      straight to both parties. When depositing the banking all you need to do is select the
      customers banking on the app and submit the docket. Again an email is generated and sent
      to both parties.</p>
    <p>That's the basics, but of course there is a tonne more features and even more to come.
      It's an application which will be constantly in development and regularly maintained.
      We are always looking for ways to improve and feedback is always welcome.</p>
    <p>It can also be linked to an online portal which can store all records, be modified to each
      user and gives the customer the ability to tailor their services. They can book collections,
      cancel collections and even order change, notifying you of everything and making the whole
      process easier for both parties.</p>
    <p>We'd love to show more or set up a demo for you, just let us know by replying to this email.</p>
  `,
    { logo: LOGO.edockets, footerEmail: "info@edockets.app" },
  );

export default icaEdocketsIntroductionEmailTemplate;
