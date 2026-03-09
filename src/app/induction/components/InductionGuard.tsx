"use client";
// InductionGuard wraps any protected induction page.
// It reads isAuthenticated from context (which was seeded by the RSC layout
// from the server-side cookie) and redirects instantly if not logged in.
// Because isAuthenticated is seeded synchronously from props (not from an
// async effect), there is zero flicker — unauthenticated renders return null
// before any protected content is painted.
import { useInduction } from "../context/InductionContext";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface InductionGuardProps {
  children: ReactNode;
  // Optional: also require course completion (used by /induction/form)
  requireCourseComplete?: boolean;
}

export default function InductionGuard({
  children,
  requireCourseComplete = false,
}: InductionGuardProps) {
  const router = useRouter();
  const { isAuthenticated, progress, totalLessons } = useInduction();

  // Derive course completion from completedLessonIds directly — not from the
  // isCourseComplete flag, which may be stale due to async setState timing.
  const courseComplete = progress.completedLessonIds.length === totalLessons;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/induction");
      return;
    }
    if (requireCourseComplete && !courseComplete) {
      router.replace("/induction/lessons");
    }
  }, [isAuthenticated, requireCourseComplete, courseComplete, router]);

  // Return null immediately — no flash of protected content.
  if (!isAuthenticated) return null;
  if (requireCourseComplete && !courseComplete) return null;

  return <>{children}</>;
}
