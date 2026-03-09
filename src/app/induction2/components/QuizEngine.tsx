"use client";
import { INDUCTION_DATA, InductionLesson } from "@/data/induction-content";
import ScrollableSection from "@/components/layout/ScrollbarSection";
import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizEngineProps {
  lesson: InductionLesson;
  onPass: () => void;
  handleReviewMaterial: () => void;
}

type QuizStatus = "idle" | "success" | "error" | "warning";

// ─── DismissButton ────────────────────────────────────────────────────────────

interface DismissButtonProps {
  onClick: () => void;
  colorClass: string;
}

const DismissButton = ({ onClick, colorClass }: DismissButtonProps) => (
  <button
    onClick={onClick}
    className={`absolute top-2 right-2 ${colorClass} transition-colors`}
    aria-label="Dismiss alert"
  >
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </button>
);

// ─── AlertBanner ──────────────────────────────────────────────────────────────

interface AlertBannerProps {
  variant: "error" | "warning" | "success";
  message: string;
  onDismiss: () => void;
}

const ALERT_STYLES: Record<
  AlertBannerProps["variant"],
  {
    bg: string;
    text: string;
    border: string;
    dismiss: string;
  }
> = {
  error: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
    dismiss: "text-red-400 hover:text-red-600",
  },
  warning: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-100",
    dismiss: "text-orange-400 hover:text-orange-600",
  },
  success: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-100",
    dismiss: "text-green-400 hover:text-green-600",
  },
};

const AlertBanner = ({ variant, message, onDismiss }: AlertBannerProps) => {
  const s = ALERT_STYLES[variant];

  return (
    <div className="px-8 pointer-events-auto animate-slide-down">
      <div
        className={`${s.bg} ${s.text} px-6 py-4 border ${s.border} text-sm font-medium rounded-sm shadow-lg relative`}
      >
        {variant === "success" && (
          <div className="absolute bottom-0 left-0 h-1 bg-green-200 animate-progress-bar" />
        )}
        <DismissButton onClick={onDismiss} colorClass={s.dismiss} />
        <div
          className="pr-6"
          role="alert"
          aria-live={variant === "error" ? "assertive" : "polite"}
        >
          {message}
        </div>
      </div>
    </div>
  );
};

// ─── QuizEngine ───────────────────────────────────────────────────────────────

const QuizEngine = ({
  lesson,
  onPass,
  handleReviewMaterial,
}: QuizEngineProps) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<QuizStatus>("idle");
  // Timeout IDs are not UI state — refs prevent unnecessary re-renders.
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const advanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-dismiss success message after 5 seconds.
  useEffect(() => {
    if (status === "success") {
      dismissTimeoutRef.current = setTimeout(() => setStatus("idle"), 5000);
      return () => {
        if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
      };
    }
  }, [status]);

  // Cancel advance timeout on unmount to avoid calling onPass on an
  // unmounted component if the user navigates away before it fires.
  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
  }, []);

  const scrollQuizToBottom = () => {
    const quizContent = document.getElementById("quiz-content-area");
    if (quizContent) {
      quizContent.scrollTo({
        top: quizContent.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    setStatus("idle");
  };

  const handleDismiss = () => {
    if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
    setStatus("idle");
  };

  const handleSubmit = () => {
    const questions = lesson.quiz?.questions ?? [];

    const allAnswered = questions.every((q) => answers[q.id] !== undefined);

    if (!allAnswered) {
      setStatus("warning");
      return;
    }

    const isCorrect = questions.every((q) => answers[q.id] === q.correctIndex);

    if (isCorrect) {
      setStatus("success");
      setTimeout(scrollQuizToBottom, 100);
      advanceTimeoutRef.current = setTimeout(() => {
        onPass();
        setAnswers({});
        setStatus("idle");
      }, 5000);
    } else {
      setStatus("error");
      setTimeout(scrollQuizToBottom, 100);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-none md:rounded-lg overflow-hidden flex flex-col md:flex-row min-h-[800px] font-montserrat">
      {/* Left column: decorative image */}
      <div className="hidden md:block md:w-[30%] relative bg-gray-100">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/induction/induction-bg.jpg')",
            filter: "grayscale(100%) brightness(1.1) contrast(1.25)",
          }}
        />
        <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
      </div>

      {/* Right column: quiz content */}
      <div
        id="quiz-content-area"
        className="w-full md:w-[70%] flex flex-col relative"
      >
        <ScrollableSection className="py-4 768px:max-h-[992px] bg-white 768px:py-4 768px:px-12 768px:pt-4 1024px:py-4 1024px:px-16 1024px:pt-4">
          {/* Questions */}
          <div className="space-y-12">
            {(lesson.quiz?.questions ?? []).map((q) => (
              <div
                key={q.id}
                className="pb-8 border-b border-dark-border/50 last:border-0"
              >
                <h3 className="text-[20px] leading-snug font-semibold text-gray-900 mb-6">
                  {q.text}
                </h3>
                <div className="space-y-4">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === optIdx;
                    const isWrongSelected =
                      status === "error" &&
                      isSelected &&
                      optIdx !== q.correctIndex;

                    return (
                      <label
                        key={optIdx}
                        className={`flex items-start gap-4 cursor-pointer group transition-colors p-1 rounded
                          hover:bg-gray-100
                          ${isSelected ? "bg-gray-100" : "text-gray-700"}
                          ${isWrongSelected ? "bg-red-100" : ""}
                        `}
                      >
                        <div className="relative flex items-center pt-1">
                          <input
                            type="radio"
                            name={q.id}
                            value={optIdx}
                            checked={isSelected}
                            onChange={() => handleSelect(q.id, optIdx)}
                            className="peer appearance-none w-5 h-5 border border-gray-400 group-hover:border-primary/60 rounded-sm group-hover:bg-primary/50 checked:bg-[#c6a54b] checked:border-[#c6a54b] checked:group-hover:bg-[#c6a54b] transition-all"
                            aria-label={`Option ${optIdx + 1}: ${opt}`}
                          />
                          <svg
                            className="absolute top-1 left-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span
                          className={`font-light leading-relaxed group-hover:text-gray-800 transition-all
                            ${isSelected ? "text-gray-900 font-medium" : "text-gray-700"}
                            ${isWrongSelected ? "text-red-500 font-medium" : ""}
                          `}
                        >
                          {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Status alerts */}
          <div className="relative pointer-events-none h-20 w-full">
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-40 pointer-events-none">
              {status === "error" && (
                <AlertBanner
                  variant="error"
                  message={INDUCTION_DATA.meta.failMessage}
                  onDismiss={handleDismiss}
                />
              )}
              {status === "warning" && (
                <AlertBanner
                  variant="warning"
                  message="Please answer all questions before submitting."
                  onDismiss={handleDismiss}
                />
              )}
              {status === "success" && (
                <AlertBanner
                  variant="success"
                  message={INDUCTION_DATA.meta.passMessage}
                  onDismiss={handleDismiss}
                />
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="mt-4 mb-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSubmit}
              disabled={status === "success"}
              className="bg-[#1a1a1a] hover:bg-black text-white px-8 py-4 text-sm font-bold uppercase tracking-wide transition-colors flex-1 text-center disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Submit your quiz answers"
            >
              Submit your answers
            </button>
            <button
              onClick={handleReviewMaterial}
              className="bg-[#c6a54b] hover:bg-[#b09140] text-white px-8 py-4 text-sm font-bold uppercase tracking-wide transition-colors flex-1 text-center"
              aria-label="Review training material"
            >
              Review Training Material
            </button>
          </div>
        </ScrollableSection>
      </div>
    </div>
  );
};

export default QuizEngine;
