import { forwardRef, useRef, useImperativeHandle } from "react";
import type { IconType } from "react-icons";
import { THEMES, getStateClasses, type ThemeType } from "./themes";

const formatABN = (value: string | number | undefined | null): string => {
  if (!value) return "";
  const valString = String(value);
  const digitsOnly = valString.replace(/\D/g, "");
  const limitedDigits = digitsOnly.slice(0, 11);

  let formattedValue = limitedDigits;
  if (limitedDigits.length > 2) {
    formattedValue = limitedDigits.slice(0, 2) + " " + limitedDigits.slice(2);
  }
  if (limitedDigits.length > 5) {
    formattedValue =
      limitedDigits.slice(0, 2) +
      " " +
      limitedDigits.slice(2, 5) +
      " " +
      limitedDigits.slice(5);
  }
  if (limitedDigits.length > 8) {
    formattedValue =
      limitedDigits.slice(0, 2) +
      " " +
      limitedDigits.slice(2, 5) +
      " " +
      limitedDigits.slice(5, 8) +
      " " +
      limitedDigits.slice(8);
  }

  return formattedValue;
};

// Omit 'onChange' and 'value' because this component returns a formatted string,
// not a DOM event. The parent receives the cleaned ABN string directly.
interface ABNInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  value?: string | number;
  onChange: (value: string) => void;
  theme?: ThemeType;
  hasError?: boolean;
  isFocused?: boolean;
  Icon?: IconType;
}

export const ABNInput = forwardRef<HTMLInputElement, ABNInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      onFocus,
      placeholder,
      theme = "dark",
      hasError = false,
      isFocused = false,
      Icon,
      disabled = false,
      required = false,
      autoComplete = "new-password",
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const themeConfig = THEMES[theme];
    const stateClasses = getStateClasses(theme, hasError, isFocused);

    useImperativeHandle(
      ref,
      () => ({
        ...inputRef.current!,
        focus: () => {
          inputRef.current?.focus();
        },
        scrollIntoView: (options?: ScrollIntoViewOptions) =>
          inputRef.current?.scrollIntoView(options),
      }),
      [],
    );

    return (
      <div className={themeConfig.inputContainer}>
        <input
          ref={inputRef}
          className={`${themeConfig.input} ${stateClasses.input}`}
          type="text"
          value={formatABN(value) || ""}
          onChange={(e) => {
            const formatted = formatABN(e.target.value);
            onChange(formatted);
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={14}
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

ABNInput.displayName = "ABNInput";
