import { useState, useEffect } from "react";
import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";
import { IconType } from "react-icons";
import { ThemeType } from "./inputs/themes";
import {
  ABNInput,
  CheckboxGroupInput,
  DateInput,
  FileUploadInput,
  SelectInput,
  SignatureInput,
  TextareaInput,
  TextInput,
} from "./SpecializedInputs";
import type { FileUploadState } from "./inputs/FileUploadInput";

// ─── FIELD TYPES ──────────────────────────────────────────────────────────────

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "tel"
  | "url"
  | "abn"
  | "date"
  | "select"
  | "textarea"
  | "number"
  | "file"
  | "signature"
  | "checkbox-group";

// ─── OPTION SHAPE ─────────────────────────────────────────────────────────────
// Shared by Select and CheckboxGroup inputs.

export interface SelectOption {
  label: string;
  value: string;
}

type BaseField<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  Icon?: IconType;
  disabled?: boolean;
};

type TextField<T extends FieldValues> = BaseField<T> & {
  type:
    | "text"
    | "email"
    | "password"
    | "tel"
    | "url"
    | "abn"
    | "signature"
    | "number";
  placeholder?: string;
  Icon2?: IconType;
  maxLength?: number;
  hidden?: boolean;
};

type TextareaField<T extends FieldValues> = BaseField<T> & {
  type: "textarea";
  placeholder?: string;
  rows?: number;
};

type DateField<T extends FieldValues> = BaseField<T> & {
  type: "date";
  dayPlaceholder?: string;
  monthPlaceholder?: string;
  yearPlaceholder?: string;
  format?: string;
  min?: string;
};

type SelectField<T extends FieldValues> = BaseField<T> & {
  type: "select";
  options: SelectOption[];
  footnote?: string;
};

export type CheckboxGroupField<T extends FieldValues> = BaseField<T> & {
  type: "checkbox-group";
  options: SelectOption[];
  variant: "horizontal" | "grid" | "site-grid" | "agreement";
  footnote?: string;
};

type FileField<T extends FieldValues> = BaseField<T> & {
  type: "file";
  accept?: string;
  multiple?: boolean;
};

export type FieldConfig<T extends FieldValues = FieldValues> =
  | TextField<T>
  | TextareaField<T>
  | DateField<T>
  | SelectField<T>
  | CheckboxGroupField<T>
  | FileField<T>;

// ─── FIELD RENDERER PROPS ─────────────────────────────────────────────────────

interface FieldRendererProps<T extends FieldValues> {
  type: FieldType;
  field: ControllerRenderProps<T, Path<T>>;
  fieldState: ControllerFieldState;

  // Focus management
  currentFocusField?: string | null;
  onFieldFocus?: (name: string) => void;
  onFieldBlur?: () => void;

  // Common visual props
  placeholder?: string;
  hidden?: boolean;
  Icon?: IconType;
  Icon2?: IconType;
  theme?: ThemeType;
  label?: string;
  footnote?: string;
  variant?: "horizontal" | "grid" | "site-grid" | "agreement";
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;

  // Type-specific props (optional — only relevant for matching type)
  options?: SelectOption[];
  rows?: number;
  maxLength?: number;
  accept?: string;
  multiple?: boolean;
  fileUploadState?: FileUploadState;

  // Date-specific props
  dayPlaceholder?: string;
  monthPlaceholder?: string;
  yearPlaceholder?: string;
  format?: string;
}

// ─── FIELD RENDERER ───────────────────────────────────────────────────────────

const FieldRenderer = <T extends FieldValues>({
  type,
  field,
  fieldState,
  currentFocusField,
  onFieldFocus,
  onFieldBlur,
  placeholder,
  hidden = false,
  Icon,
  Icon2,
  theme = "dark",
  options = [],
  rows = 3,
  maxLength,
  dayPlaceholder = "DD",
  monthPlaceholder = "MM",
  yearPlaceholder = "YYYY",
  format = "dd/MM/yyyy",
  variant = "horizontal",
  accept = "image/*",
  multiple = false,
  label,
  footnote,
  disabled = false,
  required = false,
  autoComplete = "new-password",
  fileUploadState,
}: FieldRendererProps<T>) => {
  const [isFocused, setIsFocused] = useState(false);

  const { value, onChange, onBlur, name, ref } = field;
  const { error } = fieldState;
  const hasError = !!error;

  const isCurrentFocusField = currentFocusField === name;
  const isFieldFocused = isFocused || isCurrentFocusField;

  const handleFocus = () => {
    setIsFocused(true);
    onFieldFocus?.(name);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur();
    onFieldBlur?.();
  };

  // Sync internal focus state with parent-controlled focus
  useEffect(() => {
    if (isCurrentFocusField && !isFocused) {
      setIsFocused(true);
    } else if (!isCurrentFocusField && isFocused) {
      if (currentFocusField !== null && currentFocusField !== name) {
        setIsFocused(false);
      }
    }
  }, [isCurrentFocusField, isFocused, currentFocusField, name]);

  const commonProps = {
    value,
    onChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    placeholder,
    theme,
    hasError,
    isFocused: isFieldFocused,
    disabled,
    required,
    autoComplete,
    ref,
    name,
  };

  // Legacy-hazard theme passes additional props for its own error tracking pattern
  const legacyProps =
    theme === "legacy-hazard"
      ? {
          label,
          footnote,
          currentErrorField: isCurrentFocusField ? name : null,
          setCurrentErrorField: onFieldFocus
            ? () => onFieldFocus(name)
            : undefined,
        }
      : {};

  switch (type) {
    case "text":
    case "email":
    case "password":
    case "tel":
    case "url":
      return (
        <TextInput
          {...commonProps}
          type={type}
          Icon={Icon || Icon2}
          maxLength={maxLength}
          hidden={hidden}
        />
      );

    case "abn":
      return <ABNInput {...commonProps} Icon={Icon || Icon2} />;

    case "date":
      return (
        <DateInput
          {...commonProps}
          dayPlaceholder={dayPlaceholder}
          monthPlaceholder={monthPlaceholder}
          yearPlaceholder={yearPlaceholder}
          format={format}
        />
      );

    case "select":
      return (
        <SelectInput
          {...commonProps}
          options={options}
          Icon={Icon || Icon2}
          {...legacyProps}
        />
      );

    case "textarea":
      return <TextareaInput {...commonProps} rows={rows} />;

    case "number":
      return (
        <TextInput
          {...commonProps}
          type="number"
          Icon={Icon || Icon2}
          maxLength={maxLength}
        />
      );

    case "file":
      return (
        <FileUploadInput
          ref={ref}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          theme={theme}
          hasError={hasError}
          isFocused={isFieldFocused}
          disabled={disabled}
          accept={accept}
          multiple={multiple}
          fileUploadState={fileUploadState}
        />
      );

    case "signature":
      return (
        <SignatureInput
          {...commonProps}
          label={label}
          onFocus={() => handleFocus()}
        />
      );

    case "checkbox-group": {
      // Ensure option values are strings — RHF can pass mixed types
      const safeOptions = options.map((opt) => ({
        label: opt.label,
        value: String(opt.value),
      }));

      return (
        <CheckboxGroupInput
          {...commonProps}
          value={Array.isArray(value) ? (value as string[]) : []}
          options={safeOptions}
          variant={variant}
          {...legacyProps}
        />
      );
    }

    default:
      console.warn(`Unknown field type: ${type}, falling back to text input`);
      return (
        <TextInput
          {...commonProps}
          type="text"
          Icon={Icon || Icon2}
          maxLength={maxLength}
          hidden={hidden}
        />
      );
  }
};

export default FieldRenderer;
