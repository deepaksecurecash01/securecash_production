import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";

const SuccessMessage = ({
  userName,
  onReset,
}: {
  userName: string;
  onReset: () => void;
}) => (
  <div
    className="form-page success text-center flex flex-col justify-center items-center 992px:h-[75%]"
    role="status"
    aria-live="polite"
  >
    <FaCheckCircle
      className="text-[#4bb543] text-[96px] mx-auto"
      aria-hidden="true"
    />

    <h2 className="text-white font-montserrat text-center capitalize pb-2 text-[24px] leading-[30px] mt-8">
      Thank you{userName && ` ${userName}`}!
    </h2>

    <p className="text-white font-montserrat text-center capitalize pb-2 text-[16px]">
      We received your submission.
    </p>

    <hr
      className="mt-4 w-[100px] h-[4px] rounded-[5px] border-0 bg-primary mx-auto"
      aria-hidden="true"
    />

    <div className="quote-ty-note">
      <p className="text-white font-normal text-center pb-4 text-[16px] mt-8 font-montserrat">
        We will start working on your quote now.
      </p>

      <p className="text-white font-normal text-center pb-4 text-[16px] font-montserrat">
        While you wait feel free to check out how our services can benefit your
        organisation:
      </p>

      <div className="ty-note-list-wrap mt-2">
        <ul
          className="list-none p-0 m-0 flex flex-col justify-center items-center gap-1"
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
              className="text-[#c6a54b] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
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
              className="text-[#c6a54b] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
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
              className="text-[#c6a54b] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
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
        className="bg-[#c6a54b] text-white border-none py-[15px] font-medium cursor-pointer w-full rounded-[40px] outline-none appearance-none hover:opacity-80 text-[15px] p-2.5 shadow-none font-montserrat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
        aria-label="Submit another quote request"
      >
        Want Another Quote?
      </button>
    </div>
  </div>
);

export default SuccessMessage;
