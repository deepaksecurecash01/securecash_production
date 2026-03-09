"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { INDUCTION_DATA } from "../data/induction-content";

export interface InductionProgress {
  currentLessonIndex: number;
  completedLessonIds: string[]; // Assuming IDs are strings
  isCourseComplete: boolean;
}

interface AuthStorageData {
  authenticated: boolean;
  username: string;
  timestamp: number;
}

export interface InductionContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  progress: InductionProgress;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  completeLesson: (lessonId: string) => void;
  currentLesson: (typeof INDUCTION_DATA.lessons)[number];
  totalLessons: number;
}

interface InductionProviderProps {
  children: ReactNode;
}

const InductionContext = createContext<InductionContextType | null>(null);

// 2-hour session window matches a typical induction sitting. Short enough to
// expire stale sessions but long enough not to interrupt a contractor mid-form.
const AUTH_DURATION = 2 * 60 * 60 * 1000;

export const InductionProvider = ({ children }: InductionProviderProps) => {
  // CHANGED: Read auth immediately from localStorage (synchronous)
  const getInitialAuth = (): boolean => {
    if (typeof window === "undefined") return false;

    try {
      const stored = localStorage.getItem("induction_auth");
      if (!stored) return false;

      const parsed = JSON.parse(stored);

      // Check if auth is expired (2 hours)
      if (Date.now() - parsed.timestamp > AUTH_DURATION) {
        localStorage.removeItem("induction_auth");
        return false;
      }

      return parsed.authenticated === true;
    } catch (e) {
      console.error("Auth parse error", e);
      return false;
    }
  };

  // CHANGED: Initialize with actual auth state (no loading needed)
  const [isAuthenticated, setIsAuthenticated] = useState(getInitialAuth);
  const [isLoading, setIsLoading] = useState<boolean>(false); // CHANGED: Start as false

  // Progress State
  const [progress, setProgress] = useState<InductionProgress>({
    currentLessonIndex: 0,
    completedLessonIds: [],
    isCourseComplete: false,
  });

  // CHANGED: Simplified initial load - only load progress
  useEffect(() => {
    const savedProgress = localStorage.getItem("induction_progress_v1");
    if (savedProgress) {
      try {
        const parsed: InductionProgress = JSON.parse(savedProgress);
        if (parsed.currentLessonIndex < INDUCTION_DATA.lessons.length) {
          setProgress(parsed);
        }
      } catch (e) {
        console.error("Progress parse error", e);
      }
    }
  }, []);

  // Save Progress on Change
  useEffect(() => {
    localStorage.setItem("induction_progress_v1", JSON.stringify(progress));
  }, [progress]);

  // CHANGED: Updated login to use localStorage with expiration
  const login = (username: string, password: string) => {
    const validUsername =
      process.env.NEXT_PUBLIC_INDUCTION_USERNAME || "testing";
    const validPassword = process.env.NEXT_PUBLIC_INDUCTION_PASSWORD || "abcd";

    if (username === validUsername && password === validPassword) {
      const authData: AuthStorageData = {
        authenticated: true,
        username,
        timestamp: Date.now(),
      };
      localStorage.setItem("induction_auth", JSON.stringify(authData));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  // NEW: Logout function
  const logout = () => {
    localStorage.removeItem("induction_auth");
    setIsAuthenticated(false);
  };

  const completeLesson = (lessonId: string) => {
    setProgress((prev) => {
      const newCompleted = prev.completedLessonIds.includes(lessonId)
        ? prev.completedLessonIds
        : [...prev.completedLessonIds, lessonId];

      const nextIndex = prev.currentLessonIndex + 1;
      const totalLessons = INDUCTION_DATA.lessons.length;
      const isComplete = newCompleted.length === totalLessons;

      return {
        ...prev,
        completedLessonIds: newCompleted,
        currentLessonIndex: Math.min(nextIndex, totalLessons - 1),
        isCourseComplete: isComplete,
      };
    });
  };

  return (
    <InductionContext.Provider
      value={{
        isAuthenticated,
        isLoading, // Now always false, kept for compatibility
        progress,
        login,
        logout, // NEW
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
  if (!ctx)
    throw new Error("useInduction must be used within InductionProvider");
  return ctx;
};
