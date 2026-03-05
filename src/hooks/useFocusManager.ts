import { useCallback, useRef, useState } from "react";
import { Control, FieldErrors, FieldValues, Path } from "react-hook-form";

type RHFInternalControl = {
  _fields?: Record<string, unknown>;
};

export const useFocusManager = <T extends FieldValues>(control: Control<T>) => {
  const [currentFocusField, setCurrentFocusField] = useState<Path<T> | null>(
    null,
  );
  const focusAttempts = useRef<Record<string, boolean>>({});
  const lastFocusedField = useRef<Path<T> | null>(null);

  const getFieldsInRegistrationOrder = useCallback((): Path<T>[] => {
    const ctrl = control as unknown as RHFInternalControl;
    if (!ctrl?._fields) return [];
    return Object.keys(ctrl._fields) as Path<T>[];
  }, [control]);

  const getFirstErrorFieldInRegistrationOrder = useCallback(
    (errors: FieldErrors<T>): Path<T> | null => {
      if (!errors || Object.keys(errors).length === 0) return null;

      const errorFields = Object.keys(errors);
      const registrationOrder = getFieldsInRegistrationOrder();

      for (const fieldName of registrationOrder) {
        if (errorFields.includes(fieldName)) {
          return fieldName as Path<T>;
        }
      }

      return errorFields[0] as Path<T>;
    },
    [getFieldsInRegistrationOrder],
  );

  const setFocusField = useCallback((fieldName: Path<T>) => {
    setCurrentFocusField(fieldName);
    lastFocusedField.current = fieldName;
  }, []);

  const focusField = useCallback(
    (fieldName: Path<T>) => {
      if (!control || !fieldName) return false;

      setCurrentFocusField(fieldName);

      const ctrl = control as unknown as RHFInternalControl & {
        _fields?: Record<string, { _f?: { ref?: unknown } }>;
      };
      const fieldRef = ctrl._fields?.[fieldName]?._f?.ref;

      if (!fieldRef) {
        const domElement = document.querySelector(
          `[name="${fieldName}"], [data-field-name="${fieldName}"]`,
        );
        if (domElement) {
          const focusableElement =
            domElement.querySelector("input, select, textarea, [tabindex]") ||
            domElement;
          if (focusableElement && (focusableElement as HTMLElement).focus) {
            (focusableElement as HTMLElement).focus();
            return true;
          }

          // For file inputs or custom containers — scroll into view
          if (
            domElement.querySelector('[type="file"]') ||
            domElement.getAttribute("data-field-name")
          ) {
            domElement.scrollIntoView({ behavior: "smooth", block: "center" });
            return true;
          }
        }
        return false;
      }

      const attemptFocus = () => {
        try {
          const ref = fieldRef as {
            focus?: () => void;
            querySelector?: (s: string) => HTMLElement | null;
            current?: { focus?: () => void };
            dataset?: { fieldName?: string };
            scrollIntoView?: (o?: ScrollIntoViewOptions) => void;
          };

          if (ref.focus && typeof ref.focus === "function") {
            ref.focus();
            return true;
          }

          if (ref.querySelector) {
            const focusableElement = ref.querySelector(
              "input, select, textarea, [tabindex]",
            );
            if (focusableElement) {
              focusableElement.focus();
              return true;
            }
          }

          if (ref.current?.focus) {
            ref.current.focus();
            return true;
          }

          if (ref.dataset?.fieldName === fieldName) {
            ref.scrollIntoView?.({ behavior: "smooth", block: "center" });
            return true;
          }

          return false;
        } catch (error) {
          console.error(`Focus error for ${fieldName}:`, error);
          return false;
        }
      };

      const success = attemptFocus();

      if (!success && !focusAttempts.current[fieldName]) {
        focusAttempts.current[fieldName] = true;
        setTimeout(() => {
          attemptFocus();
          delete focusAttempts.current[fieldName];
        }, 100);
      }

      return success;
    },
    [control],
  );

  const focusFirstError = useCallback(
    (errors: FieldErrors<T>) => {
      if (!errors || Object.keys(errors).length === 0) {
        setCurrentFocusField(null);
        return false;
      }

      const firstErrorField = getFirstErrorFieldInRegistrationOrder(errors);
      if (!firstErrorField) return false;

      return focusField(firstErrorField);
    },
    [focusField, getFirstErrorFieldInRegistrationOrder],
  );

  const clearFocus = useCallback(() => {
    setCurrentFocusField(null);
  }, []);

  const isFieldFocused = useCallback(
    (fieldName: Path<T>) => currentFocusField === fieldName,
    [currentFocusField],
  );

  return {
    focusField,
    focusFirstError,
    clearFocus,
    setFocusField,
    currentFocusField,
    isFieldFocused,
    getFieldsInRegistrationOrder,
    getFirstErrorFieldInRegistrationOrder,
    lastFocusedField: lastFocusedField.current,
  };
};
