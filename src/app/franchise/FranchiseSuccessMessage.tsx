import { FaCheckCircle } from "react-icons/fa";

interface FranchiseSuccessMessageProps {
  userName: string;
}

const FranchiseSuccessMessage = ({
  userName,
}: FranchiseSuccessMessageProps) => (
  <div
    className="form-submitted-message text-center py-4 absolute h-full top-0 flex flex-col justify-center items-center bg-[#f1f1f1] z-10"
    style={{ background: "#f1f1f1" }}
    role="status"
    aria-live="polite"
  >
    <div className="480px:w-[90%] mx-auto 992px:h-[75%]">
      <FaCheckCircle
        className="text-[#4bb543] text-[96px] mx-auto"
        aria-hidden="true"
      />

      <h3 className="text-primary font-montserrat text-center capitalize pb-2 text-[32px] leading-[30px] mt-8 font-bold">
        Thank you{userName && ` ${userName}`}!
      </h3>

      <hr
        className="mt-4 mb-6 w-[100px] h-[4px] rounded-[5px] border-0 mx-auto bg-primary"
        aria-hidden="true"
      />

      <p className="mb-6">
        Your form has been submitted successfully. The meeting scheduler should
        appear shortly.
      </p>
    </div>
  </div>
);

export default FranchiseSuccessMessage;
