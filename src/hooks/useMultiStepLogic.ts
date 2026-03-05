import { useCallback, useMemo, useState } from "react";
import {
  DefaultValues,
  FieldValues,
  UseFormGetValues,
  UseFormReset,
} from "react-hook-form";

export interface MultiStepConfig {
  steps: string[];
  conditional?: boolean;
  getNextSteps?: (data: FieldValues) => string[];
}

export interface HybridConfig {
  enabled: boolean;
  reviewStep?: number;
  submitEnabled?: boolean;
}

interface UseMultiStepLogicProps<T extends FieldValues> {
  multiStep?: MultiStepConfig;
  hybrid?: HybridConfig;
  defaultValues: DefaultValues<T>;
  isQuoteForm?: boolean;
  sendProgressiveEmail?: (data: FieldValues, stepId: string) => Promise<void>;
  getAccumulatedData?: (
    prevData: FieldValues,
    currData: FieldValues,
  ) => FieldValues;
}

// Extracts the Service array from step data in a type-safe way.
// Service is a conditional routing field — its value determines which steps follow.
const getServices = (data: FieldValues): string[] => {
  const service = data.Service;
  return Array.isArray(service) ? (service as string[]) : [];
};

export const useMultiStepLogic = <T extends FieldValues>({
  multiStep,
  hybrid,
  defaultValues,
  isQuoteForm,
  sendProgressiveEmail,
  getAccumulatedData,
}: UseMultiStepLogicProps<T>) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<DefaultValues<T>>(defaultValues);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const initialSubmitEnabled = hybrid?.submitEnabled ?? false;
  const [submitButtonEnabled, setSubmitButtonEnabled] =
    useState(initialSubmitEnabled);
  const [showReviewStep, setShowReviewStep] = useState(false);

  const isMultiStep =
    !!multiStep && multiStep.steps && multiStep.steps.length > 1;
  const isHybrid = !!hybrid && hybrid.enabled;

  const getCurrentStep = useCallback(() => {
    if (!isMultiStep) {
      return { currentStep: 0, stepId: "single", isFirst: true, isLast: true };
    }

    const stepId = multiStep!.steps[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === multiStep!.steps.length - 1;
    const isReviewStep = isHybrid && stepId === "review";
    const isSubmitStep = isHybrid && currentStep >= (hybrid!.reviewStep || 3);

    return {
      currentStep,
      stepId,
      isFirst,
      isLast,
      isReviewStep,
      isSubmitStep,
      submitButtonEnabled,
    };
  }, [
    isMultiStep,
    currentStep,
    multiStep,
    isHybrid,
    submitButtonEnabled,
    hybrid,
  ]);

  const goToStep = useCallback(
    (
      targetStep: number,
      getValues: UseFormGetValues<T>,
      reset: UseFormReset<T>,
      clearFocus: () => void,
    ) => {
      if (!isMultiStep) return;

      const currentFormData = getValues();
      const updatedStepData = { ...stepData, ...currentFormData };
      setStepData(updatedStepData);
      setCurrentStep(targetStep);
      reset(updatedStepData);
      clearFocus();
    },
    [isMultiStep, stepData],
  );

  const goBack = useCallback(
    (
      getValues: UseFormGetValues<T>,
      reset: UseFormReset<T>,
      clearFocus: () => void,
    ) => {
      if (currentStep > 0) {
        goToStep(currentStep - 1, getValues, reset, clearFocus);
      }
    },
    [currentStep, goToStep],
  );

  const getNextValidSteps = useCallback(
    (services: string[]) => {
      if (!isMultiStep || !multiStep!.conditional || !multiStep!.getNextSteps) {
        return [];
      }
      return multiStep!.getNextSteps({ Service: services });
    },
    [isMultiStep, multiStep],
  );

  const moveToNextStep = useCallback(
    async (stepDataUpdate: Partial<T> = {}) => {
      const updatedStepData = { ...stepData, ...stepDataUpdate };
      setStepData(updatedStepData);
      setCompletedSteps((prev) => new Set([...prev, currentStep]));

      if (isQuoteForm && multiStep) {
        const { stepId } = getCurrentStep();
        if (getAccumulatedData && sendProgressiveEmail) {
          const accumulatedData = getAccumulatedData(stepData, stepDataUpdate);
          sendProgressiveEmail(accumulatedData, stepId).catch(console.warn);
        }
      }

      if (!isMultiStep) return updatedStepData;

      if (isHybrid) {
        const reviewStep = hybrid!.reviewStep || 3;
        if (currentStep === reviewStep - 1) {
          setCurrentStep(reviewStep);
          setSubmitButtonEnabled(true);
          return updatedStepData;
        }
      }

      const { stepId } = getCurrentStep();

      if (multiStep!.conditional && stepId === "quote") {
        const services = getServices(updatedStepData);
        const nextSteps = getNextValidSteps(services);

        if (nextSteps.length === 0) return updatedStepData;

        const nextStepId = nextSteps[0];
        const nextStepIndex = multiStep!.steps.findIndex(
          (step) => step === nextStepId,
        );
        if (nextStepIndex !== -1) {
          setCurrentStep(nextStepIndex);
        }
      } else {
        const nextStep = currentStep + 1;
        if (nextStep < multiStep!.steps.length) {
          setCurrentStep(nextStep);
        }
      }

      return updatedStepData;
    },
    [
      stepData,
      currentStep,
      isMultiStep,
      isHybrid,
      hybrid,
      getCurrentStep,
      multiStep,
      isQuoteForm,
      sendProgressiveEmail,
      getAccumulatedData,
      getNextValidSteps,
    ],
  );

  const isLastStep = useCallback(
    (formDataOverride: T | null = null) => {
      if (!isMultiStep) return true;

      if (isHybrid) {
        return currentStep === multiStep!.steps.length - 1;
      }

      if (multiStep!.conditional && multiStep!.getNextSteps) {
        const dataToCheck = (formDataOverride || stepData) as FieldValues;
        const nextSteps = multiStep!.getNextSteps(dataToCheck);
        return nextSteps.length === 0;
      }

      return currentStep === multiStep!.steps.length - 1;
    },
    [isMultiStep, isHybrid, currentStep, multiStep, stepData],
  );

  const getProgress = useMemo(() => {
    if (!isMultiStep) return { current: 1, total: 1, percentage: 100 };

    if (isHybrid) {
      const reviewStep = hybrid!.reviewStep || 3;
      const total = reviewStep + 1;
      const current = currentStep >= reviewStep ? total : currentStep + 1;

      return {
        current,
        total,
        percentage: Math.round((current / total) * 100),
        completed: completedSteps.size,
        isInSubmitSection: currentStep >= reviewStep,
      };
    }

    return {
      current: currentStep + 1,
      total: multiStep!.steps.length,
      percentage: Math.round(
        ((currentStep + 1) / multiStep!.steps.length) * 100,
      ),
      completed: completedSteps.size,
    };
  }, [
    isMultiStep,
    currentStep,
    multiStep,
    completedSteps.size,
    isHybrid,
    hybrid,
  ]);

  const resetStepState = useCallback(() => {
    setCurrentStep(0);
    setStepData(defaultValues);
    setCompletedSteps(new Set());
    if (isHybrid) {
      setSubmitButtonEnabled(hybrid?.submitEnabled ?? false);
      setShowReviewStep(false);
    }
  }, [defaultValues, isHybrid, hybrid]);

  return {
    currentStep,
    stepData,
    completedSteps,
    submitButtonEnabled,
    showReviewStep,
    isMultiStep,
    isHybrid,
    getCurrentStep,
    goToStep,
    goBack,
    moveToNextStep,
    isLastStep,
    getNextValidSteps,
    getProgress,
    resetStepState,
    setStepData,
  };
};
