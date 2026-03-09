"use client";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { INDUCTION_DATA } from "@/data/induction-content";
import { inductionLogin, inductionLogout } from "../actions/inductionAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InductionProgress {
  currentLessonIndex: number;
  completedLessonIds: string[];
  isCourseComplete: boolean;
}

export interface InductionContextType {
  // Auth — isAuthenticated reflects cookie presence, managed server-side.
  // On first render it is false; layout/redirect logic is handled by RSC.
  // Client components use it only for UI state (e.g. button label).
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  // Progress
  progress: InductionProgress;
  completeLesson: (lessonId: string) => void;
  currentLesson: (typeof INDUCTION_DATA.lessons)[number];
  totalLessons: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROGRESS_KEY = "induction_progress_v1";

const DEFAULT_PROGRESS: InductionProgress = {
  currentLessonIndex: 0,
  completedLessonIds: [],
  isCourseComplete: false,
};

// ─── Context ──────────────────────────────────────────────────────────────────

const InductionContext = createContext<InductionContextType | null>(null);

export const InductionProvider = ({
  children,
  initialAuthenticated = false,
}: {
  children: ReactNode;
  // RSC layout reads the cookie server-side and passes the result as a prop.
  // This avoids any client-side cookie reading or auth hydration flicker.
  initialAuthenticated?: boolean;
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);

  const [progress, setProgress] = useState<InductionProgress>(DEFAULT_PROGRESS);

  // Restore progress from localStorage on mount (client only).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_KEY);
      if (!saved) return;
      const parsed: InductionProgress = JSON.parse(saved);
      // Validate before applying — don't restore corrupt or out-of-bounds state.
      if (
        typeof parsed.currentLessonIndex === "number" &&
        parsed.currentLessonIndex < INDUCTION_DATA.lessons.length &&
        Array.isArray(parsed.completedLessonIds)
      ) {
        setProgress(parsed);
      }
    } catch {
      // Corrupt localStorage — silently reset to defaults.
      localStorage.removeItem(PROGRESS_KEY);
    }
  }, []);

  // Persist progress on every change.
  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress]);

  // ─── Auth ──────────────────────────────────────────────────────────────────

  const login = async (
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await inductionLogin(username, password);
    if (result.success) {
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = async (): Promise<void> => {
    await inductionLogout();
    setIsAuthenticated(false);
    // Clear progress on logout so the next user starts fresh.
    localStorage.removeItem(PROGRESS_KEY);
    setProgress(DEFAULT_PROGRESS);
  };

  // ─── Progress ─────────────────────────────────────────────────────────────

  const completeLesson = (lessonId: string) => {
    setProgress((prev) => {
      const newCompleted = prev.completedLessonIds.includes(lessonId)
        ? prev.completedLessonIds
        : [...prev.completedLessonIds, lessonId];

      const totalLessons = INDUCTION_DATA.lessons.length;
      const nextIndex = prev.currentLessonIndex + 1;
      const isCourseComplete = newCompleted.length === totalLessons;

      return {
        completedLessonIds: newCompleted,
        currentLessonIndex: Math.min(nextIndex, totalLessons - 1),
        isCourseComplete,
      };
    });
  };

  const clearProgress = () => {
    localStorage.removeItem(PROGRESS_KEY);
    setProgress(DEFAULT_PROGRESS);
  };

  return (
    <InductionContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        progress,
        completeLesson,
        currentLesson: INDUCTION_DATA.lessons[progress.currentLessonIndex],
        totalLessons: INDUCTION_DATA.lessons.length,
      }}
    >
      {children}
    </InductionContext.Provider>
  );
};

export const useInduction = (): InductionContextType => {
  const ctx = useContext(InductionContext);
  if (!ctx) throw new Error("useInduction must be used within InductionProvider");
  return ctx;
};