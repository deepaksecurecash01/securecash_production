import { useCallback } from "react";
import { FieldValues } from "react-hook-form";

export const useProgressiveEmail = (isQuoteForm: boolean) => {
  const sendProgressiveEmail = useCallback(
    async (stepData: FieldValues, currentStepId: string) => {
      if (!isQuoteForm) return;

      try {
        const response = await fetch("/api/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formType: "quote",
            ...stepData,
            progressiveStep: currentStepId,
            isProgressiveEmail: true,
          }),
        });

        if (!response.ok) {
          console.warn(`Progressive email failed for step: ${currentStepId}`);
        }
      } catch (error: unknown) {
        console.error(
          `Progressive email error for step: ${currentStepId}`,
          error,
        );
      }
    },
    [isQuoteForm],
  );

  // Merges accumulated step data with current form data.
  // Kept as a stable callback so consumers don't need to manage this merge themselves.
  const getAccumulatedData = useCallback(
    (stepData: FieldValues, currentFormData: FieldValues): FieldValues => {
      return { ...stepData, ...currentFormData };
    },
    [],
  );

  return {
    sendProgressiveEmail,
    getAccumulatedData,
  };
};
