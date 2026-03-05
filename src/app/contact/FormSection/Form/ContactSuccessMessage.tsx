import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";

interface ContactSuccessMessageProps {
  userName: string;
  onReset: () => void;
}

const ContactSuccessMessage = ({
  userName,
  onReset,
}: ContactSuccessMessageProps) => (
  <div
    className="form-submitted-message text-center py-4 absolute h-full top-0 flex flex-col justify-center items-center bg-[#f1f1f1] z-10 w-[90%]"
    style={{ background: "#f1f1f1" }}
    role="status"
    aria-live="polite"
  >
    <div className="480px:w-[90%] mx-auto 992px:h-[75%]">
      <FaCheckCircle
        className="text-[#4bb543] text-[96px] mx-auto"
        aria-hidden="true"
      />

      <h2 className="text-primary font-montserrat text-center capitalize pb-2 text-[32px] leading-[30px] mt-8 font-bold">
        Thank you{userName && ` ${userName}`}!
      </h2>

      <p className="font-montserrat text-center capitalize pb-2 text-[16px]">
        Your message has been sent successfully.
      </p>

      <hr
        className="mt-4 w-[100px] h-[4px] rounded-[5px] border-0 mx-auto bg-primary"
        aria-hidden="true"
      />

      <div className="quote-ty-note">
        <p className="font-normal text-center pb-4 text-[16px] mt-8 font-montserrat">
          We&apos;ve received your inquiry and will get back to you shortly.
        </p>
        <p className="font-normal text-center pb-4 text-[16px] font-montserrat">
          In the meantime, feel free to explore more about our services:
        </p>

        <div className="ty-note-list-wrap mt-2">
          <ul
            className="list-none p-0 m-0 flex flex-col justify-center items-center gap-1 font-medium"
            role="list"
          >
            <li className="cash-collection mb-2 flex items-center">
              <img
                src="/images/contentpageicons/cashcollection.png"
                alt=""
                className="inline-block mr-2 w-[30px]"
                aria-hidden="true"
              />
              <Link
                href="/cash-collection/"
                className="text-[#c6a54b] hover:underline"
              >
                Cash Collections
              </Link>
            </li>
            <li className="cash-delivery mb-2 flex items-center">
              <img
                src="/images/contentpageicons/cashdelivery.png"
                alt=""
                className="inline-block mr-2 w-[30px]"
                aria-hidden="true"
              />
              <Link
                href="/cash-delivery/"
                className="text-[#c6a54b] hover:underline"
              >
                Cash Deliveries
              </Link>
            </li>
            <li className="cash-counting mb-2 flex items-center">
              <img
                src="/images/contentpageicons/cashcounting.png"
                alt=""
                className="inline-block mr-2 w-[30px]"
                aria-hidden="true"
              />
              <Link
                href="/cash-counting/"
                className="text-[#c6a54b] hover:underline"
              >
                Cash Counting
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="button-controls-container w-[80%] mx-auto mt-8">
        <button
          type="button"
          onClick={onReset}
          className="bg-[#c6a54b] text-white border-none py-[15px] font-medium cursor-pointer w-full rounded-[40px] outline-none appearance-none hover:opacity-80 text-[15px] p-2.5 shadow-none font-montserrat"
          aria-label="Send another message"
        >
          Send Another Message
        </button>
      </div>
    </div>
  </div>
);

export default ContactSuccessMessage;
