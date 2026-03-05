import { forwardRef } from "react";
import type { IconType } from "react-icons";
import { THEMES, getStateClasses, type ThemeType } from "./themes";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  theme?: ThemeType;
  hasError?: boolean;
  isFocused?: boolean;
  Icon?: IconType;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  hidden?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      onFocus,
      placeholder,
      type = "text",
      theme = "dark",
      hasError = false,
      isFocused = false,
      Icon,
      disabled = false,
      required = false,
      autoComplete = "new-password",
      maxLength,
      hidden = false,
      ...props
    },
    ref,
  ) => {
    const themeConfig = THEMES[theme];
    const stateClasses = getStateClasses(theme, hasError, isFocused);

    if (hidden) {
      return (
        <input
          ref={ref}
          type="text"
          value={value || ""}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
          {...props}
        />
      );
    }

    return (
      <div className={themeConfig.inputContainer}>
        <input
          ref={ref}
          className={`${themeConfig.input} ${stateClasses.input}`}
          type={type}
          value={value || ""}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          {...props}
        />
        {Icon && (
          <Icon className={`${themeConfig.icon} ${stateClasses.icon}`} />
        )}
      </div>
    );
  },
);

TextInput.displayName = "TextInput";
