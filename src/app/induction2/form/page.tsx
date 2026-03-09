"use client";
import { useInduction } from "@/context/InductionContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import InductionForm from "./InductionForm";

export default function FormPage() {
  const router = useRouter();
  const { progress } = useInduction();

  useEffect(() => {
    if (!progress.isCourseComplete) {
      router.push("/induction/lessons");
    }
  }, [progress, router]);

  if (!progress.isCourseComplete) {
    return null;
  }

  return (
    <section className="1024px:py-[120px] 768px:bg-[#f2f2f2]">
      <div className="max-w-[1200px] mx-auto">
        <InductionForm />
      </div>
    </section>
  );
}
