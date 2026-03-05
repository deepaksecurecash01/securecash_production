import { submitForm } from "@/utils/apiClient";
import { prepareFormMetadata } from "@/utils/formHelpers";
import { useState } from "react";

interface UseFormSubmissionProps<T> {
  formType: string;
  formId: string;
  onSuccess?: (result: unknown, finalData: T) => void;
  onError?: (error: unknown, data: T) => void;
  prepareData?: (data: T) => Promise<unknown>;
  enableHoneypot?: boolean;
  honeypotField?: string;
  submitEndpoint?: string;
}

export const useFormSubmission = <T>({
  formType,
  formId,
  onSuccess,
  onError,
  prepareData,
  enableHoneypot = true,
  honeypotField = "BotField",
  submitEndpoint = "/api/forms",
}: UseFormSubmissionProps<T>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleSubmission = async (formData: T) => {
    try {
      setSubmissionError(null);

      if (
        enableHoneypot &&
        (formData as Record<string, unknown>)[honeypotField]
      ) {
        return;
      }

      setIsSubmitting(true);

      const metadata = await prepareFormMetadata(formType, formId);

      // Merge metadata into formData first, so prepareData always receives
      // the enriched payload — IP, device, browser, formType, formId included.
      // Previously prepareData received raw formData, silently discarding metadata.
      const enriched = {
        ...(formData as Record<string, unknown>),
        ...metadata,
      } as T;

      const finalData: unknown = prepareData
        ? await prepareData(enriched)
        : enriched;

      const result = await submitForm(finalData, submitEndpoint);

      setIsSubmitted(true);
      setIsSubmitting(false);

      onSuccess?.(result, finalData as T);

      return result;
    } catch (error: unknown) {
      console.error("Form submission error:", error);
      setIsSubmitting(false);
      setSubmissionError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );

      onError?.(error, formData);

      throw error;
    }
  };

  const resetSubmission = () => {
    setIsSubmitting(false);
    setIsSubmitted(false);
    setSubmissionError(null);
  };

  return {
    isSubmitting,
    isSubmitted,
    submissionError,
    handleSubmission,
    resetSubmission,
  };
};
