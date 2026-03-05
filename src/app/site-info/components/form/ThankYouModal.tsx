"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { FaCheckCircle, FaTimes } from "react-icons/fa";
import Link from "next/link";

// 1. Define strict Modal Types
export type ModalType = "Thankyou" | "Business";

// 2. Component Props
interface ThankYouModalProps {
  onClose?: () => void;
  type: ModalType;
  showThankYou?: boolean;
}

// 3. Sub-component Props
interface ThankYouContentProps {
  onClose: () => void;
}

interface BusinessContentProps {
  onYesClick: (e: React.MouseEvent) => void;
  onNoClick: (e: React.MouseEvent) => void;
}

const MODAL_TYPES = {
  THANKYOU: "Thankyou" as const,
  BUSINESS: "Business" as const,
};

const MODAL_STYLES = {
  backdrop: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    pointerEvents: "all" as const,
  },
  content: {
    pointerEvents: "all" as const,
    zIndex: 99999,
  },
  button: {
    pointerEvents: "all" as const,
    cursor: "pointer",
    zIndex: 999999,
  },
};


const manageBodyScroll = (lock: boolean) =>
{
    if (lock) {
        const scrollY = window.scrollY;
        document.body.style.top = `-${scrollY}px`;
        document.body.classList.add("modal-on");
    } else {
        const scrollY = document.body.style.top;
        document.body.classList.remove("modal-on");
        document.body.style.top = "";
        if (scrollY) {
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
    }
};

const ThankYouModalContent = ({ onClose }: ThankYouContentProps) => (
    <div className="site-modal-outer site-info-modal bus-type-modal" style={MODAL_STYLES.backdrop}>
        <div
            className="site-modal-inner business-type-dailog-box--card flex flex-col items-center justify-center relative"
            onClick={(e) => e.stopPropagation()}
            style={MODAL_STYLES.content}
        >
            <FaCheckCircle className="text-[#4bb543] text-[68px] mb-4" />

            <p className="business-type-dailog-box--card__text-strong mb-4">
                Thank you! All these details have been sent through. You will receive a confirmation email shortly.
            </p>

            <p className="business-type-thank-you--card__text mb-4">
                For any further inquiries, please contact{" "}
                <a href="mailto:customers@securecash.com.au" className="text-primary">
                    customers@securecash.com.au
                </a>
            </p>

            <div className="business-type-thank-you--card__btn-wrap w-full">
                <button
                    className="btn-gold-alt btn-ty-note-submit"
                    onClick={onClose}
                    style={MODAL_STYLES.button}
                >
                    Add another Location
                </button>
                <Link href="/">
                    <button className="btn-gold-alt btn-ty-note-submit" style={MODAL_STYLES.button}>
                        Return to Homepage
                    </button>
                </Link>
            </div>

            <button
                className="absolute -top-[13px] -right-[11px] bg-black p-2 rounded-full"
                onClick={onClose}
                style={MODAL_STYLES.button}
            >
                <FaTimes className="text-[#ffff] text-[20px]" />
            </button>
        </div>
    </div>
);

const BusinessModalContent = ({ onYesClick, onNoClick }: BusinessContentProps) => (
    <div className="site-modal-outer site-info-modal bus-type-modal" style={MODAL_STYLES.backdrop}>
        <div
            className="site-modal-inner business-type-dailog-box--card"
            onClick={(e) => e.stopPropagation()}
            style={MODAL_STYLES.content}
        >
            <p className="business-type-dailog-box--card__text-strong mb-4">
                Is this going to be a regular service?
            </p>
            <p className="business-type-dailog-box--card__text">
                If so, then please click <span>&apos;Yes&apos;</span>.
            </p>
            <p className="business-type-dailog-box--card__text-strong mb-4">
                If not and it is only going to be for a once off special event e.g. School Fete or after hours Function
            </p>
            <p className="business-type-dailog-box--card__text">
                then please click <span>&apos;No&apos;</span>.
            </p>
            <div className="business-type-dailog-box--card__btn-wrap">
                <button
                    className="btn-gold-alt btn-location-submit btn-yes"
                    onClick={onYesClick}
                    style={MODAL_STYLES.button}
                >
                    Yes
                </button>
                <button
                    className="btn-black btn-location-submit btn-no"
                    onClick={onNoClick}
                    style={MODAL_STYLES.button}
                >
                    No
                </button>
            </div>
        </div>
    </div>
);

export default function ThankYouModal({ onClose, type, showThankYou = false } : ThankYouModalProps)
{
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const shouldShowModal = type === MODAL_TYPES.THANKYOU ? showThankYou : true;

    const closeModal = useCallback(() =>
    {
        setIsOpen(false);
        onClose?.();
    }, [onClose]);

    const createNavigationHandler = useCallback((path?: string) =>
    {
        return (e: React.MouseEvent) =>
        {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
            if (path) {
                router.push(path);
            }
        };
    }, [router, closeModal]);

    const handleYesClick = createNavigationHandler();
    const handleNoClick = createNavigationHandler("/special-event");

    useEffect(() =>
    {
        setIsOpen(shouldShowModal);
    }, [shouldShowModal]);

    useEffect(() =>
    {
        manageBodyScroll(isOpen && shouldShowModal);
        return () => manageBodyScroll(false);
    }, [isOpen, shouldShowModal]);

    if (!isOpen || !shouldShowModal) {
        return null;
    }

    if (type === MODAL_TYPES.THANKYOU) {
        return <ThankYouModalContent onClose={closeModal} />;
    }

    if (type === MODAL_TYPES.BUSINESS) {
        return <BusinessModalContent onYesClick={handleYesClick} onNoClick={handleNoClick} />;
    }

    return null;
}