import { forwardRef } from "react";
import { THEMES, type ThemeType, getStateClasses } from "./themes";

interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  theme?: ThemeType;
  hasError?: boolean;
  isFocused?: boolean;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
}

export const TextareaInput = forwardRef<
  HTMLTextAreaElement,
  TextareaInputProps
>(
  (
    {
      value,
      onChange,
      onBlur,
      onFocus,
      placeholder,
      rows = 3,
      theme = "dark",
      hasError = false,
      isFocused = false,
      disabled = false,
      required = false,
      autoComplete = "new-password",
      ...props
    },
    ref,
  ) => {
    const themeConfig = THEMES[theme];
    const stateClasses = getStateClasses(theme, hasError, isFocused);

    return (
      <textarea
        ref={ref}
        className={`${themeConfig.textarea} ${stateClasses.textarea}`}
        value={value || ""}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        autoComplete={autoComplete}
        disabled={disabled}
        required={required}
        {...props}
      />
    );
  },
);

TextareaInput.displayName = "TextareaInput";
