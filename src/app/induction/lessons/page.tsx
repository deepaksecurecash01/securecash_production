"use client";
import Container from "@/components/layout/Container";
import { useInduction } from "@/context/InductionContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LessonModuleBlock from "../components/LessonModuleBlock";
import LessonVideo from "../components/LessonVideo";
import QuizEngine from "../components/QuizEngine";

export default function LessonsPage() {
  const router = useRouter();
  const { currentLesson, progress, totalLessons, completeLesson } =
    useInduction();
  const [showQuiz, setShowQuiz] = useState<boolean>(false);

  if (!currentLesson) return null;

  const percentage = Math.round(
    (progress.currentLessonIndex / totalLessons) * 100,
  );

  const handleLessonPass = (): void => {
    completeLesson(currentLesson.id);

    if (progress.currentLessonIndex + 1 >= totalLessons) {
      router.push("/induction/form");
    } else {
      setShowQuiz(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  const handleStartQuiz = (): void => {
    setShowQuiz(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleReviewMaterial = (): void => {
    setShowQuiz(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <div className="pt-10">
      <Container className="px-8 1280px:px-0">
        {/* Progress Bar */}
        <div className="mb-10 max-w-[1200px] mx-auto pt-8">
          <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase font-montserrat">
            <span>Course Progress</span>
            <span>{percentage}% Completed</span>
          </div>
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Lesson Container */}
        <div className="max-w-[1200px] mx-auto bg-white rounded-lg overflow-hidden">
          <div className="pt-8">
            <h2 className="text-[26px] font-bold mb-6 text-gray-800 font-montserrat">
              {showQuiz ? `Quiz: ${currentLesson.title}` : currentLesson.title}
            </h2>
          </div>

          {!showQuiz ? (
            <div
              className="induction-single-main--content"
              style={{ margin: "0", maxWidth: "100%" }}
            >
              {currentLesson.modules.map((block, index) => (
                <LessonModuleBlock key={index} block={block} index={index} />
              ))}
            </div>
          ) : (
            <div className="animate-fade-in pb-12 mb-10">
              <button
                onClick={handleReviewMaterial}
                className="mb-6 text-sm text-primary hover:underline flex items-center gap-2 font-semibold font-montserrat"
              >
                ← Review Training Material
              </button>
              <QuizEngine
                lesson={currentLesson}
                onPass={handleLessonPass}
                handleReviewMaterial={handleReviewMaterial}
              />
            </div>
          )}
        </div>
      </Container>

      {!showQuiz && (
        <div className="relative w-full h-[250px] mt-12">
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center grayscale"
            style={{
              backgroundImage: "url('/images/induction/induction-banner.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handleStartQuiz}
              className="bg-[#c6a54b] hover:bg-[#b09140] text-white text-[17px] font-bold py-4 px-12 rounded uppercase tracking-wide transition-all transform hover:scale-105 shadow-md font-montserrat"
            >
              Start Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
