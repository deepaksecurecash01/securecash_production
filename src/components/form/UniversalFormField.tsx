import { Controller, FieldValues, Path, Control } from "react-hook-form";
import FieldRenderer, { FieldType, SelectOption } from "./FieldRenderer";
import WarningPopup from "./WarningPopup";
import { ThemeType } from "./inputs/themes";
import { IconType } from "react-icons";
import type { FileUploadState } from "./inputs/FileUploadInput";

// ─── WARNING POPUP POSITION ───────────────────────────────────────────────────
// Calculates the top offset class for the error popup based on theme and type.
// Lives here because UniversalFormField owns the positioning context.

const getWarningPopupClass = (theme: ThemeType, type: FieldType): string | undefined => {
  if (theme === "legacy-hazard") return "top-16";
  if (theme === "ica" && type === "file") return "top-[210px]";
  if (theme === "ica") return "top-12";
  if (theme === "light" && type === "textarea") return "top-[150px]";
  if (theme === "dark" && type === "textarea") return "top-[236px]";
  if (theme === "dark" && type === "signature") return "top-[252px]";
  return undefined;
};

const LABEL_CLASSES: Partial<Record<ThemeType, string>> = {
  dark: "text-white text-base inline-block mt-4 mb-2 w-full text-left",
  light: "text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0",
};

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface UniversalFormFieldProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  control: Control<T>;
  type?: FieldType;
  label?: string;
  hidden?: boolean;
  theme?: ThemeType;

  // Focus management
  currentFocusField?: string | null;
  onFieldFocus?: (name: string) => void;
  onFieldBlur?: () => void;

  // Visuals
  placeholder?: string;
  Icon?: IconType;
  Icon2?: IconType;
  footnote?: string;
  variant?: "horizontal" | "grid" | "site-grid" | "agreement";

  // Data
  options?: SelectOption[];

  // Input-specific configs
  rows?: number;
  maxLength?: number;
  dayPlaceholder?: string;
  monthPlaceholder?: string;
  yearPlaceholder?: string;
  format?: string;
  accept?: string;
  multiple?: boolean;
  fileUploadState?: FileUploadState;

  // Standard HTML attributes
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const UniversalFormField = <T extends FieldValues>({
  name,
  control,
  type = "text",
  label,
  hidden = false,
  theme = "dark",
  currentFocusField,
  onFieldFocus,
  onFieldBlur,
  placeholder,
  Icon,
  Icon2,
  options = [],
  rows = 3,
  maxLength,
  footnote,
  dayPlaceholder = "DD",
  monthPlaceholder = "MM",
  yearPlaceholder = "YYYY",
  format = "dd/MM/yyyy",
  variant = "horizontal",
  accept = "image/*",
  multiple = false,
  fileUploadState,
  disabled = false,
  required = false,
  autoComplete = "new-password",
}: UniversalFormFieldProps<T>) => {
  const labelClass = LABEL_CLASSES[theme];

  if (!control) {
    console.error(
      `UniversalFormField: 'control' prop is required for field '${name}'`,
    );
    return (
      <div className="text-red-500 p-2 border border-red-500">
        Error: Missing &apos;control&apos; prop for field &apos;{name}&apos;
      </div>
    );
  }

  return (
    <div className="relative">
      {label && labelClass && !hidden && (
        <label className={labelClass}>{label}</label>
      )}

      {/* Single Controller — WarningPopup lives inside so we use one subscription */}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <FieldRenderer
              type={type}
              field={field}
              fieldState={fieldState}
              currentFocusField={currentFocusField}
              onFieldFocus={onFieldFocus}
              onFieldBlur={onFieldBlur}
              placeholder={placeholder}
              Icon={Icon}
              Icon2={Icon2}
              hidden={hidden}
              theme={theme}
              options={options}
              rows={rows}
              maxLength={maxLength}
              dayPlaceholder={dayPlaceholder}
              monthPlaceholder={monthPlaceholder}
              yearPlaceholder={yearPlaceholder}
              format={format}
              disabled={disabled}
              required={required}
              autoComplete={autoComplete}
              variant={variant}
              accept={accept}
              multiple={multiple}
              fileUploadState={fileUploadState}
              label={label}
              footnote={footnote}
            />

            {fieldState.error && currentFocusField === name && (
              <WarningPopup
                error={fieldState.error.message ?? ""}
                isFirstError={true}
                className={getWarningPopupClass(theme, type)}
              />
            )}
          </>
        )}
      />
    </div>
  );
};

UniversalFormField.displayName = "UniversalFormField";

export default UniversalFormField;