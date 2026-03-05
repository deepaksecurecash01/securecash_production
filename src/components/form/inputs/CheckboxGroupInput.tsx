import { forwardRef, useState } from "react";
import { FaCircle } from "react-icons/fa";
import Checkbox from "./Checkbox";
import { THEMES, type ThemeType } from "./themes";
import styles from "./Checkbox.module.css";

interface CheckboxOption {
  label: string;
  value: string;
}

type CheckboxVariant = "horizontal" | "grid" | "site-grid" | "agreement";

interface CheckboxGroupInputProps {
  value?: string[];
  onChange: (values: string[]) => void;
  options?: CheckboxOption[];
  name: string;
  theme?: ThemeType;
  hasError?: boolean;
  isFocused?: boolean;
  disabled?: boolean;
  label?: string;
  footnote?: string;
  variant?: CheckboxVariant;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  // Legacy-hazard theme uses these for its own error field tracking
  currentErrorField?: string | null;
  setCurrentErrorField?: (field: string | null) => void;
}

interface LayoutConfig {
  container: string;
  wrapper: string;
  warningPosition: string;
}

const getLayoutConfig = (variant: CheckboxVariant): LayoutConfig => {
  switch (variant) {
    case "grid":
      return {
        container: "text-left relative",
        wrapper:
          "chkbox-container w-full mx-auto text-left relative chkbox-grid grid grid-flow-col place-content-around 1366px:place-content-between grid-rows-5 600px:grid-rows-3 gap-2",
        warningPosition: "top-[142px]",
      };
    case "site-grid":
      return {
        container: "text-left relative",
        wrapper:
          "chkbox-container w-full mx-auto text-left relative chkbox-grid grid grid-flow-col place-content-around gap-1 1366px:place-content-between grid-rows-5 600px:grid-rows-4 gap-2",
        warningPosition: "top-[142px]",
      };
    case "agreement":
      return {
        container: "text-left relative",
        wrapper:
          "control-wrapper relative w-full flex flex-row justify-left items-center mt-2",
        warningPosition: "top-12 left-[58px]",
      };
    case "horizontal":
    default:
      return {
        container: "text-left relative",
        wrapper:
          "control-wrapper relative flex flex-row justify-around items-center w-full mt-2",
        warningPosition: "top-12 left-[58px]",
      };
  }
};

// ─── LEGACY CHECKBOX ──────────────────────────────────────────────────────────
// Used only when theme === 'legacy-hazard'. Has its own local active state
// and interacts with the legacy error field tracking pattern.

interface LegacyCheckboxProps {
  value: string;
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  style?: React.CSSProperties;
  currentErrorField?: string | null;
  setCurrentErrorField?: (field: string | null) => void;
}

const LegacyCheckbox = ({
  value,
  className = "",
  inputRef,
  style = {},
  label,
  name,
  checked,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  currentErrorField,
  setCurrentErrorField,
}: LegacyCheckboxProps) => {

  const handleFocus = () => {
    onFocus?.();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
    if (currentErrorField === name) {
      setCurrentErrorField?.(null);
    }
  };

  return (
    <div className={`${className} ${styles.checkbox}`} style={style}>
      <input
        type="checkbox"
        name={value}
        id={value}
        value={value}
        checked={checked}
        ref={inputRef}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        data-validate="CheckboxMulti"
        className="text-sm p-2.5 shadow-none font-montserrat border-none min-w-[28px] h-[28px] opacity-0 absolute z-40 peer cursor-pointer"
        disabled={disabled}
      />
      <label
        className="font-light text-left w-full relative flex cursor-pointer"
        htmlFor={value}
      >
        <span className="min-w-[28px] h-[28px]"></span>
        <div>{label}</div>
      </label>
    </div>
  );
};

// ─── CHECKBOX GROUP INPUT ─────────────────────────────────────────────────────

export const CheckboxGroupInput = forwardRef<
  HTMLInputElement,
  CheckboxGroupInputProps
>(
  (
    {
      value,
      onChange,
      onBlur,
      onFocus,
      options = [],
      name,
      theme = "dark",
      hasError = false,
      isFocused = false,
      variant = "horizontal",
      label,
      footnote,
      disabled = false,
      currentErrorField,
      setCurrentErrorField,
      ...props
    },
    ref,
  ) => {
    const themeConfig = THEMES[theme];

    const handleToggle = (optionValue: string, checked: boolean) => {
      const currentValues = value || [];
      const newValues = checked
        ? [...currentValues, optionValue]
        : currentValues.filter((val) => val !== optionValue);
      onChange(newValues);
    };

    if (theme === "legacy-hazard") {
      return (
        <div className={themeConfig.checkboxGroupContainer}>
          <FaCircle className={themeConfig.bulletPoint} />
          <div className={themeConfig.contentWrapper}>
            <label className={themeConfig.label}>{label}</label>
            <div className={themeConfig.checkboxGroupWrapper}>
              {options.map((option, index) => (
                <LegacyCheckbox
                  key={option.value}
                  inputRef={index === 0 ? ref : null}
                  label={option.label}
                  value={option.value}
                  name={name}
                  checked={(value || []).includes(option.value)}
                  onChange={(e) => handleToggle(option.value, e.target.checked)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  disabled={disabled}
                  currentErrorField={currentErrorField}
                  setCurrentErrorField={setCurrentErrorField}
                  className={themeConfig.checkboxItem}
                />
              ))}
            </div>
            {footnote && (
              <p
                className={themeConfig.checkboxGroupFootnote}
                style={{ textAlign: "left" }}
              >
                {footnote}
              </p>
            )}
          </div>
        </div>
      );
    }

    const layoutConfig = getLayoutConfig(variant);

    return (
      <div className={layoutConfig.container}>
        <div className={layoutConfig.wrapper}>
          {options.map((option, index) => (
            <Checkbox
              key={option.value}
              inputRef={index === 0 ? ref : null}
              label={option.label}
              value={option.value}
              name={name}
              theme={theme}
              register={() => ({
                name,
                onChange: (e) => handleToggle(option.value, e.target.checked),
                checked: (value || []).includes(option.value),
              })}
              setCurrentErrorField={onFocus ? () => onFocus() : undefined}
              className="chkbox float-left text-left relative"
              {...props}
            />
          ))}
        </div>
      </div>
    );
  },
);

CheckboxGroupInput.displayName = "CheckboxGroupInput";
