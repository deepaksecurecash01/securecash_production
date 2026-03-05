import { InductionProvider } from "@/context/InductionContext";
import { Metadata } from "next";
import React from "react";
import "./style.css";

export const metadata: Metadata = {
  title: "Banking Courier Induction",
};

interface InductionLayoutProps {
  children: React.ReactNode;
}

export default function InductionLayout({ children }: InductionLayoutProps) {
  return (
    <>
      <InductionProvider>
        <div className="induction-wrapper font-montserrat min-h-[60vh]">
          {children}
        </div>
      </InductionProvider>
    </>
  );
}
