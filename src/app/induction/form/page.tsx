"use client";
import InductionGuard from "../components/InductionGuard";
import InductionHero from "../components/InductionHero";
import InductionForm from "../components/InductionForm";

export default function InductionFormPage() {
  return (
    // requireCourseComplete: true — if user somehow navigates here without
    // completing all lessons (e.g. direct URL), InductionGuard sends them
    // back to /induction/lessons. No localStorage manipulation can bypass this
    // because InductionGuard derives completion from completedLessonIds.length,
    // not from the isCourseComplete flag.
    <InductionGuard requireCourseComplete>
      <InductionHero />
      <section className="1024px:py-[120px] 768px:bg-[#f2f2f2]">
        <div className="max-w-[1200px] mx-auto">
          <InductionForm />
        </div>
      </section>
    </InductionGuard>
  );
}
