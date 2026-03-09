// RSC — no "use client". Runs on the server so cookies() works directly.
// This is the ONE layout for the entire /induction subtree.
// The old lessons/layout.tsx is deleted — its auth guard and hero now live here
// and in the individual pages respectively.
import { getInductionSession } from "./actions/inductionAuth";
import { InductionProvider } from "./context/InductionContext";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";
import "./induction.css";

export const metadata: Metadata = {
  title: "Banking Courier Induction | SecureCash",
  description: "Complete your SecureCash banking courier induction online.",
};

// Routes within /induction that are accessible WITHOUT being logged in.
// Every other route requires a valid session cookie.
const PUBLIC_PATHS = ["/induction", "/induction/"];

interface InductionLayoutProps {
  children: React.ReactNode;
  // Next.js passes the current pathname via the params slot in layouts.
  // We use the request URL to determine if the current path is public.
}

export default async function InductionLayout({
  children,
}: InductionLayoutProps) {
  const isAuthenticated = await getInductionSession();

  // We cannot read pathname directly in a layout without a slot, so we pass
  // isAuthenticated down to the Provider and let individual protected pages
  // redirect themselves via a shared <InductionGuard> client component.
  // The layout's own redirect handles the login page: if already authenticated,
  // visiting /induction sends you straight to /induction/lessons.
  //
  // NOTE: We cannot conditionally redirect here without knowing the current path.
  // The guard pattern (redirect in page if not auth) is used for protected pages.
  // The login page itself checks isAuthenticated and redirects if already logged in.

  return (
    <InductionProvider initialAuthenticated={isAuthenticated}>
      <div className="induction-wrapper font-montserrat min-h-[60vh]">
        {children}
      </div>
    </InductionProvider>
  );
}
