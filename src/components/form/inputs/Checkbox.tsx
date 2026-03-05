import {
  type ReactNode,
  type CSSProperties,
  type Ref,
  type InputHTMLAttributes,
} from "react";
import styles from "./Checkbox.module.css";
import { ThemeType } from "./themes";

interface CheckboxProps {
  value: string;
  label: ReactNode;
  name: string;
  theme?: ThemeType;
  className?: string;
  style?: CSSProperties;
  inputRef?: Ref<HTMLInputElement>;
  // register returns standard input attributes — used to wire up checked/onChange
  // without coupling this component directly to React Hook Form
  register?: (name: string) => InputHTMLAttributes<HTMLInputElement>;
  setCurrentErrorField?: (field: string | null) => void;
}

const getLabelClasses = (theme: ThemeType): string => {
  const themeClasses: Record<ThemeType, string> = {
    light:
      "font-medium inline-block text-left w-full relative cursor-pointer text-primary-text",
    ica: "font-medium text-left w-full relative flex cursor-pointer",
    dark: "text-white text-base inline-block mb-2 text-left w-full relative cursor-pointer",
    "legacy-hazard":
      "text-white text-base inline-block mb-2 text-left w-full relative cursor-pointer",
  };

  return themeClasses[theme] ?? themeClasses.dark;
};

const Checkbox = ({
  value,
  className = "",
  inputRef,
  style = {},
  register,
  label,
  name,
  theme = "dark",
  setCurrentErrorField,
}: CheckboxProps) => {
  const checkboxProps = register ? register(name) : {};

  const handleFocus = () => setCurrentErrorField?.(name);
  const handleBlur = () => setCurrentErrorField?.(null);

  return (
    <div className={`${className} ${styles.checkbox}`} style={style}>
      <input
        type="checkbox"
        id={value}
        name={value}
        ref={inputRef}
        value={value}
        {...checkboxProps}
        onFocus={handleFocus}
        onBlur={handleBlur}
        data-validate="CheckboxMulti"
        className="text-sm p-2.5 shadow-none font-montserrat border-none min-w-[28px] h-[28px] opacity-0 absolute z-40 peer cursor-pointer"
      />
      <label className={getLabelClasses(theme)} htmlFor={value}>
        <span className="min-w-[28px] h-[28px]"></span>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
