// 1. Define the allowed theme names
export type ThemeType = "dark" | "light" | "legacy-hazard" | "ica" ;

// 2. Define the shape of a theme config.
// All required fields must exist on every theme, even if empty string.
// Optional fields are only used by specific themes (e.g. file upload for ica).
interface ThemeConfig {
  input: string;
  inputContainer: string;
  textarea: string;
  select: string;
  selectContainer: string;
  selectIcon: string;
  selectArrow: string;
  icon: string;
  datePicker: string;
  datePickerContainer: string;

  // These might be empty for some themes, but they MUST exist
  label: string;
  bulletPoint: string;
  contentWrapper: string;
  fieldContainer: string;

  // Select specifics
  selectInputContainer: string;
  selectFootnote: string;

  // Checkbox specifics
  checkboxGroupContainer: string;
  checkboxGroupWrapper: string;
  checkboxItem: string;
  checkboxGroupFootnote: string;

  // File upload specifics — optional because only ica uses them
  fileUpload?: string;
  fileUploadInactive?: string;
  fileUploadActive?: string;
  fileUploadContent?: string;
  fileUploadIcon?: string;
  fileUploadText?: string;
  fileUploadSubtext?: string;
  filePreview?: string;
  filePreviewImage?: string;
  filePreviewName?: string;
  filePreviewSize?: string;
  fileRemoveButton?: string;

  // Legacy checkbox specifics — optional because only legacy-hazard uses them
  checkboxInput?: string;
  checkboxLabel?: string;
  checkboxSpan?: string;
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
  dark: {
    input:
      "w-full text-sm py-2 px-3 shadow-none font-montserrat border-none rounded-sm h-9",
    inputContainer:
      "relative w-full flex items-center bg-white rounded-[2px] border",
    textarea:
      "w-full text-sm rounded-md border border-gray-400 mb-2.5 p-4 shadow-none font-montserrat bg-white",
    select:
      "w-full text-sm rounded-md border border-white pl-12 shadow-none font-[Montserrat] bg-black text-white leading-6 h-9 appearance-none",
    selectContainer:
      "input-container input-container-select w-full mx-auto text-left flex items-center relative",
    selectIcon:
      "icon absolute text-[22px] rounded-l bg-black min-w-[20px] text-center ml-4",
    selectArrow:
      "rotate-45 inline-block border-solid border-white border-t-0 border-l-0 border-r-2 border-b-2 p-[3px] absolute right-5 top-1/2 transform -translate-y-1/2 group-hover:border-active-text",
    icon: "min-w-[50px] text-[18px] text-[#999]",
    datePicker:
      "w-full text-sm py-2 px-3 shadow-none font-montserrat border-none rounded-sm bg-white text-left leading-6 appearance-none",
    datePickerContainer:
      "relative w-full flex items-center bg-white rounded-[2px] border",

    // Not used by dark theme — empty strings satisfy the required interface
    label: "",
    bulletPoint: "",
    contentWrapper: "",
    fieldContainer: "",
    selectInputContainer: "",
    selectFootnote: "",
    checkboxGroupContainer: "",
    checkboxGroupWrapper: "",
    checkboxItem: "",
    checkboxGroupFootnote: "",
  },
  light: {
    input:
      "w-full text-sm py-2 px-3 shadow-none font-montserrat border-none rounded-sm h-9",
    inputContainer:
      "relative w-full flex items-center bg-white rounded-[2px] border",
    textarea:
      "w-full text-sm rounded-sm border-none p-4 shadow-none font-montserrat bg-white",
    select:
      "w-full text-sm rounded-sm border border-white pl-12 shadow-none font-[Montserrat] leading-6 h-9 appearance-none",
    selectContainer:
      "input-container input-container-select w-full mx-auto text-left flex items-center relative rounded-[2px] border",
    selectIcon:
      "icon absolute text-[18px] rounded-l min-w-[20px] text-center ml-4",
    selectArrow:
      "rotate-45 inline-block border-solid border-dark-border border-t-0 border-l-0 border-r-2 border-b-2 p-[3px] absolute right-5 top-1/2 transform -translate-y-1/2 group-hover:border-active-text",
    icon: "min-w-[50px] text-[18px] text-[#999]",
    datePicker:
      "w-full text-sm py-2 px-3 shadow-none font-montserrat border-none rounded-sm bg-white text-left leading-6 appearance-none",
    datePickerContainer:
      "relative w-full flex items-center bg-white rounded-[2px] border",

    // Not used by light theme — empty strings satisfy the required interface
    label: "",
    bulletPoint: "",
    contentWrapper: "",
    fieldContainer: "",
    selectInputContainer: "",
    selectFootnote: "",
    checkboxGroupContainer: "",
    checkboxGroupWrapper: "",
    checkboxItem: "",
    checkboxGroupFootnote: "",
  },
  "legacy-hazard": {
    // Not used by legacy-hazard theme — empty strings satisfy the required interface
    input: "",
    inputContainer: "",
    textarea: "",
    icon: "",
    datePicker: "",
    datePickerContainer: "",

    fieldContainer: "relative",
    bulletPoint:
      "text-primary text-[8px] mt-3 mr-3 flex-shrink-0 absolute top-3",
    contentWrapper: "pl-4",
    label:
      "text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0",
    selectContainer: "relative",
    selectInputContainer:
      "input-container input-container-select w-full mx-auto text-left flex items-center relative rounded-[2px] border",
    selectIcon:
      "icon absolute text-[18px] rounded-l min-w-[20px] text-center ml-4",
    select:
      "w-full text-sm rounded-sm border border-white pl-12 shadow-none leading-6 h-9 appearance-none",
    selectArrow:
      "rotate-45 inline-block border-solid border-dark-border border-t-0 border-l-0 border-r-2 border-b-2 p-[3px] absolute right-5 top-1/2 transform -translate-y-1/2 group-hover:border-active-text",
    selectFootnote: "text-sm text-gray-600 mt-2 italic",
    checkboxGroupContainer: "relative mt-4",
    checkboxGroupWrapper: "chkbox-container w-full mx-auto text-left relative",
    checkboxItem:
      "chkbox float-left text-left mt-2 mb-2 relative text-primary-text w-full",
    checkboxInput:
      "text-sm p-2.5 shadow-none font-montserrat border-none w-[28px] h-[28px] opacity-0 absolute z-40 peer",
    checkboxLabel: "font-light text-left w-full relative flex cursor-pointer",
    checkboxSpan: "w-[28px] h-[28px]",
    checkboxGroupFootnote: "text-sm text-gray-600 mt-2 italic",
  },
  ica: {
    input:
      "w-full text-sm py-2 px-3 shadow-none font-montserrat border-none rounded-sm",
    inputContainer:
      "relative w-full flex items-center bg-white rounded-[2px] border border-dark-border/50",
    textarea:
      "w-full text-sm rounded-sm border-none p-4 shadow-none font-montserrat bg-white",
    select:
      "w-full text-sm rounded-sm border border-white pl-12 pr-12 shadow-none font-montserrat leading-6 h-9 appearance-none bg-white",
    selectContainer:
      "input-container input-container-select w-full mx-auto text-left flex items-center relative rounded-[2px] border border-dark-border/50",
    selectIcon:
      "icon absolute text-[18px] rounded-l min-w-[20px] text-center ml-4 z-10",
    selectArrow:
      "rotate-45 inline-block border-solid border-dark-border border-t-0 border-l-0 border-r-2 border-b-2 p-[3px] absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none",
    label:
      "text-primary-text text-[16px] font-medium inline-block mt-4 mb-2 w-full text-left px-1 768px:px-0",
    icon: "min-w-[50px] text-[18px]",
    datePicker:
      "w-full text-sm py-2 px-3 shadow-none font-montserrat border-none rounded-sm bg-white text-left leading-6 appearance-none",
    datePickerContainer:
      "relative w-full flex items-center bg-white rounded-[2px] border border-dark-border/50",

    // Not used by ica theme — empty strings satisfy the required interface
    bulletPoint: "",
    contentWrapper: "",
    fieldContainer: "",
    selectInputContainer: "",
    selectFootnote: "",
    checkboxGroupContainer: "",
    checkboxGroupWrapper: "",
    checkboxItem: "",
    checkboxGroupFootnote: "",

    // ica-specific file upload classes
    fileUpload:
      "relative w-full border-2 border-dashed rounded-lg text-center transition-colors h-[200px] overflow-hidden",
    fileUploadInactive: "border-dark-border/50 bg-white",
    fileUploadActive: "border-primary bg-blue-50",
    fileUploadContent:
      "h-full w-full flex flex-col justify-center items-center bg-[rgb(242,242,242,0.3)] p-4 relative",
    fileUploadIcon: "mx-auto text-4xl text-gray-400 mb-4 w-16 h-16",
    fileUploadText: "text-sm text-gray-600 mb-2",
    fileUploadSubtext: "text-xs text-gray-500",
    filePreview: "space-y-3",
    filePreviewImage: "w-36 h-24 object-cover rounded mb-2",
    filePreviewName: "text-sm text-gray-700 text-center font-medium",
    filePreviewSize: "text-xs text-gray-500",
    fileRemoveButton:
      "absolute top-4 right-4 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 z-10",
  },
};

export const getStateClasses = (
  theme: ThemeType,
  hasError: boolean = false,
  isFocused: boolean = false,
) => {
  const baseStyles = {
    input: hasError ? "focus:outline-red-600" : "focus:outline-primary",
    textarea: hasError ? "focus:outline-red-600" : "focus:outline-primary",
    select: hasError
      ? "focus:outline-red-600 focus:border-none focus:ring-0"
      : "focus:outline-primary",
    datePicker: hasError
      ? "focus:outline-red-600 focus:border-none focus:ring-0"
      : "focus:outline-primary",
  };

  const getIconColor = (iconType: string) => {
    if (hasError && isFocused) return "text-red-500";
    if (isFocused) return "text-primary";

    // dark theme: select icon is white, regular icon is grey
    // all other themes: both icons are grey
    if (theme === "dark") {
      return iconType === "selectIcon" ? "text-white" : "text-[#999]";
    }

    return "text-[#999]";
  };

  return {
    ...baseStyles,
    icon: getIconColor("icon"),
    selectIcon: getIconColor("selectIcon"),
    dateIcon: getIconColor("dateIcon"),
  };
};
