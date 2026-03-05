import { ThemeType } from "@/components/form/inputs/themes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import {
  DefaultValues,
  FieldErrors,
  FieldValues,
  Path,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { SafeParseReturnType, z, ZodSchema } from "zod";
import { useFileUploadState, FileUploadResult } from "./useFileUploadState";
import { useFocusManager } from "./useFocusManager";
import { useFormSubmission } from "./useFormSubmission";
import {
  useMultiStepLogic,
  MultiStepConfig,
  HybridConfig,
} from "./useMultiStepLogic";
import { useProgressiveEmail } from "./useProgressiveEmail";
import type { FieldConfig } from "@/components/form/FieldRenderer";

// ─── FILE UPLOAD CONFIG ───────────────────────────────────────────────────────

interface FileUploadFieldConfig {
  field: string;
  prefix?: string;
}

interface FileUploadCompressionConfig {
  targetSizeKB?: number;
  maxSizeMB: number;
  allowedTypes: string[];
}

export interface FileUploadConfig {
  enabled: boolean;
  fields: FileUploadFieldConfig[];
  compression?: FileUploadCompressionConfig;
  concurrencyLimit?: number;
}

// ─── ATTACHMENT TYPE ──────────────────────────────────────────────────────────

interface Attachment {
  filename: string;
  data: string | ArrayBuffer;
}

// ─── FORM MANAGER CONFIG ──────────────────────────────────────────────────────

interface FormManagerConfig<T extends FieldValues> {
  schema: ZodSchema | Record<string, ZodSchema>;
  defaultValues?: DefaultValues<T>;
  formType: string;
  formId: string;
  onSuccess?: (result: unknown, finalData: unknown) => void;
  onError?: (error: unknown, data: T) => void;
  prepareData?: (data: T) => Promise<unknown>;
  theme?: ThemeType;
  multiStep?: MultiStepConfig | null;
  hybrid?: HybridConfig | null;
  fileUpload?: FileUploadConfig | null;
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export const useFormManager = <T extends FieldValues>(
  config: FormManagerConfig<T>,
) => {
  const {
    schema,
    defaultValues = {} as DefaultValues<T>,
    formType,
    formId,
    onSuccess,
    onError,
    prepareData,
    theme = "dark",
    multiStep = null,
    hybrid = null,
    fileUpload = null,
  } = config;

  const isQuoteForm = formType === "quote";
  const hasFileUpload = !!fileUpload && fileUpload.enabled;

  const fileUploadState = useFileUploadState();
  const progressiveEmail = useProgressiveEmail(isQuoteForm);

  const multiStepLogic = useMultiStepLogic({
    multiStep: multiStep ?? undefined, // useMultiStepLogic accepts undefined, not null
    hybrid: hybrid ?? undefined,
    defaultValues,
    isQuoteForm,
    sendProgressiveEmail: progressiveEmail.sendProgressiveEmail,
    getAccumulatedData: progressiveEmail.getAccumulatedData,
  });

  const getCurrentSchema = useCallback((): ZodSchema => {
    if (!multiStepLogic.isMultiStep) return schema as ZodSchema;

    const { stepId } = multiStepLogic.getCurrentStep();

    if (typeof schema === "object" && !("parse" in schema)) {
      const schemaMap = schema as Record<string, ZodSchema>;
      if (schemaMap[stepId]) return schemaMap[stepId];
    }

    return z.object({});
  }, [schema, multiStepLogic]);

  const form: UseFormReturn<T> = useForm<T>({
    resolver: zodResolver(getCurrentSchema()),
    defaultValues: multiStepLogic.stepData as DefaultValues<T>,
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
  });

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
    reset,
    setFocus,
  } = form;

  const focus = useFocusManager(control);

  const submission = useFormSubmission({
    formType,
    formId,
    onSuccess,
    onError,
    prepareData: async (data: T) => {
      let processedData: Record<string, unknown> = {
        ...(data as Record<string, unknown>),
      };

      if (hasFileUpload && fileUpload!.fields.length > 0) {
        const attachments: Attachment[] = [];
        const missingFiles: string[] = [];

        for (const { field, prefix } of fileUpload!.fields) {
          const fieldValue = processedData[field];
          if (!fieldValue) continue;

          const files: File[] = Array.isArray(fieldValue)
            ? (fieldValue as File[])
            : [fieldValue as File];

          for (const file of files) {
            const matchingResult = Array.from(
              fileUploadState.fileUploadResults.values(),
            ).find(
              (result: FileUploadResult) =>
                result.originalFile?.name === file.name &&
                result.originalFile?.size === file.size &&
                result.isProcessed &&
                result.data,
            );

            if (matchingResult && matchingResult.data) {
              attachments.push({
                filename: `${prefix || field}.${file.name.split(".").pop()}`,
                data: matchingResult.data,
              });
            } else {
              missingFiles.push(file.name);
            }
          }
        }

        if (missingFiles.length > 0) {
          throw new Error(
            `File(s) "${missingFiles.join('", "')}" were not processed. Please remove and re-upload the file(s).`,
          );
        }

        processedData = { ...processedData, attachments };
      }

      if (prepareData) {
        return await prepareData(processedData as T);
      }

      return processedData;
    },
  });

  const handleFieldFocus = useCallback(
    (fieldName: Path<T>) => {
      focus.setFocusField(fieldName);
    },
    [focus],
  );

  const handleFieldBlur = useCallback(() => {
    focus.clearFocus();
  }, [focus]);

  const handleValidationError = useCallback(
    (validationErrors: FieldErrors<T>) => {
      const focusSuccess = focus.focusFirstError(validationErrors);

      if (!focusSuccess) {
        const firstErrorField = Object.keys(validationErrors)[0] as Path<T>;
        try {
          setFocus(firstErrorField);
        } catch {
          if (hasFileUpload && fileUpload!.fields) {
            const fileField = fileUpload!.fields.find(
              (f) => f.field === firstErrorField,
            );
            if (fileField) {
              const element = document.querySelector(
                `[data-field-name="${firstErrorField}"]`,
              );
              element?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        }
      }
    },
    [focus, setFocus, hasFileUpload, fileUpload],
  );

  const validateCurrentStep = useCallback(
    (data: T): SafeParseReturnType<T, T> => {
      const currentSchema = getCurrentSchema();
      if (!currentSchema) return { success: true, data };
      return currentSchema.safeParse(data);
    },
    [getCurrentSchema],
  );

  const handleSubmit = rhfHandleSubmit(
    async (formData: T) => {
      const validation = validateCurrentStep(formData);
      if (!validation.success) {
        handleValidationError(
          validation.error.flatten().fieldErrors as unknown as FieldErrors<T>,
        );
        return false;
      }

      const isCurrentlyLastStep = multiStepLogic.isLastStep(formData);

      if (isCurrentlyLastStep) {
        const finalStepData = { ...multiStepLogic.stepData, ...formData };
        focus.clearFocus();
        return await submission.handleSubmission(finalStepData);
      } else {
        const updatedStepData = await multiStepLogic.moveToNextStep(formData);
        focus.clearFocus();
        reset(updatedStepData as DefaultValues<T>);
        return true;
      }
    },
    (validationErrors) => {
      handleValidationError(validationErrors);
      return false;
    },
  );

  const getFieldProps = useCallback(
    (fieldConfig: FieldConfig) => {
      const { name, type = "text", ...otherConfig } = fieldConfig;

      // Cast control to Control<FieldValues> at this boundary.
      // Control<T> is invariant in T, so TypeScript won't allow implicit
      // widening even though the runtime behaviour is identical.
      const baseProps = {
        ...otherConfig,
        name,
        type,
        control: control as import("react-hook-form").Control<FieldValues>,
        currentFocusField: focus.currentFocusField,
        onFieldFocus: handleFieldFocus as (name: string) => void,
        onFieldBlur: handleFieldBlur,
      };

      if (type === "file" && hasFileUpload) {
        return {
          ...baseProps,
          fileUploadState: {
            setUploadResult: fileUploadState.setUploadResult,
            clearUploadResult: fileUploadState.clearUploadResult,
            getCompletedUploads: fileUploadState.getCompletedUploads,
            compression: fileUpload!.compression ?? {
              maxSizeMB: 5,
              allowedTypes: [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "application/pdf",
              ],
            },
          },
        };
      }

      return baseProps;
    },
    [
      control,
      focus.currentFocusField,
      handleFieldFocus,
      handleFieldBlur,
      hasFileUpload,
      fileUploadState,
      fileUpload,
    ],
  );

  const getStepData = useCallback(
    () => multiStepLogic.stepData,
    [multiStepLogic.stepData],
  );

  const resetForm = useCallback(() => {
    multiStepLogic.resetStepState();
    if (hasFileUpload) {
      fileUploadState.clearAllUploads();
    }
    reset(defaultValues);
    focus.clearFocus();
    submission.resetSubmission();
  }, [
    defaultValues,
    reset,
    focus,
    submission,
    hasFileUpload,
    fileUploadState,
    multiStepLogic,
  ]);

  const goToStep = useCallback(
    (targetStep: number) => {
      multiStepLogic.goToStep(targetStep, getValues, reset, focus.clearFocus);
    },
    [multiStepLogic, getValues, reset, focus],
  );

  const goBack = useCallback(() => {
    multiStepLogic.goBack(getValues, reset, focus.clearFocus);
  }, [multiStepLogic, getValues, reset, focus]);

  return {
    control,
    handleSubmit,
    errors,
    isSubmitting: submission.isSubmitting,
    isSubmitted: submission.isSubmitted,
    submissionError: submission.submissionError,
    currentFocusField: focus.currentFocusField,
    focusField: focus.focusField,
    clearFocus: focus.clearFocus,
    isFieldFocused: focus.isFieldFocused,
    handleFieldFocus,
    handleFieldBlur,
    setValue,
    watch,
    getValues,
    reset,
    getFieldProps,
    hasFieldError: (fieldName: Path<T>) => !!errors[fieldName],
    getFieldError: (fieldName: Path<T>) =>
      (errors[fieldName]?.message as string) || null,
    getCurrentStep: multiStepLogic.getCurrentStep,
    getCurrentSchema,
    getStepData,
    isLastStep: multiStepLogic.isLastStep,
    validateCurrentStep,
    moveToNextStep: multiStepLogic.moveToNextStep,
    resetForm,
    getProgress: multiStepLogic.getProgress,
    goToStep,
    goBack,
    submitButtonEnabled: multiStepLogic.submitButtonEnabled,
    showReviewStep: multiStepLogic.showReviewStep,
    handleValidationError,
    sendProgressiveEmail: progressiveEmail.sendProgressiveEmail,
    getAccumulatedData: progressiveEmail.getAccumulatedData,
    ...(hasFileUpload && {
      fileUpload: {
        setUploadResult: fileUploadState.setUploadResult,
        clearUploadResult: fileUploadState.clearUploadResult,
        getCompletedUploads: fileUploadState.getCompletedUploads,
        hasCompletedUploads: fileUploadState.fileUploadResults.size > 0,
        uploadCount: fileUploadState.fileUploadResults.size,
      },
    }),
    theme,
  };
};
