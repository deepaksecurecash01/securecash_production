"use server";
import { cookies } from "next/headers";

const SESSION_COOKIE = "induction_session";
const SESSION_MAX_AGE = 60 * 60 * 2; // 2 hours

// Credentials live in server-only env vars (no NEXT_PUBLIC_ prefix).
// They are never bundled into client JS and cannot be read from DevTools.
export async function inductionLogin(
  username: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const validUsername = process.env.INDUCTION_USERNAME;
  const validPassword = process.env.INDUCTION_PASSWORD;
  if (!validUsername || !validPassword) {
    console.error(
      "[Induction] INDUCTION_USERNAME or INDUCTION_PASSWORD env var not set",
    );
    return {
      success: false,
      error: "Service unavailable. Please contact support.",
    };
  }

  if (username !== validUsername || password !== validPassword) {
    return { success: false, error: "Invalid credentials. Please try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "authenticated", {
    httpOnly: true, // inaccessible to JS — cannot be read or forged from browser
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE,
    path: "/induction",
  });

  return { success: true };
}

export async function inductionLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// Used by RSC layouts to check auth without any client-side logic.
export async function getInductionSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === "authenticated";
}
