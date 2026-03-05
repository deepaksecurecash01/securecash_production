import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
} from "react";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import { THEMES, ThemeType } from "./themes";
// ─── TYPES ────────────────────────────────────────────────────────────────────

interface DateInputProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  onBlur?: (event: React.FocusEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onEnterPress?: (date: Date | null) => void;
  theme?: ThemeType;
  hasError?: boolean;
  isFocused?: boolean;
  dayPlaceholder?: string;
  monthPlaceholder?: string;
  yearPlaceholder?: string;
  format?: string;
  disabled?: boolean;
  autoComplete?: string;
  name?: string;
}

export interface DateInputHandle {
  focus: () => void;
  scrollIntoView: (options?: ScrollIntoViewOptions) => void;
  current: HTMLDivElement | null;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Reads the three date input fields and reconstructs a Date if all are filled
// and valid. Returns null if the values are incomplete or out of range.
const parseInputGroupDate = (container: HTMLDivElement | null): Date | null => {
  const inputs = container?.querySelectorAll<HTMLInputElement>(
    ".react-date-picker__inputGroup__input",
  );
  if (!inputs || inputs.length < 3) return null;

  const [dayStr, monthStr, yearStr] = [
    inputs[0].value,
    inputs[1].value,
    inputs[2].value,
  ];
  if (!dayStr || !monthStr || !yearStr) return null;

  const [day, month, year] = [dayStr, monthStr, yearStr].map((v) =>
    parseInt(v, 10),
  );
  if ([day, month, year].some(isNaN)) return null;
  if (
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    year < 1000 ||
    year > 9999
  )
    return null;

  const parsed = new Date(year, month - 1, day);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export const DateInput = forwardRef<DateInputHandle, DateInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      onFocus,
      onEnterPress,
      theme = "dark",
      hasError = false,
      isFocused = false,
      dayPlaceholder = "DD",
      monthPlaceholder = "MM",
      yearPlaceholder = "YYYY",
      format = "dd/MM/yyyy",
      disabled = false,
      name,
      ...props
    },
    ref,
  ) => {
    const datePickerRef = useRef<HTMLDivElement>(null);
    const themeConfig = THEMES[theme];
    const hasAutoFocusedRef = useRef(false);
    const lastCommittedValueRef = useRef<Date | null>(value);

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [displayValue, setDisplayValue] = useState<Date | null>(value);
    const [isDateSelectedFromCalendar, setIsDateSelectedFromCalendar] =
      useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    useEffect(() => {
      setDisplayValue(value);
      lastCommittedValueRef.current = value;
    }, [value]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        const input = datePickerRef.current?.querySelector<HTMLInputElement>(
          ".react-date-picker__inputGroup__input",
        );
        input?.focus();
      },
      scrollIntoView: (options) => {
        datePickerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          ...options,
        });
      },
      current: datePickerRef.current,
    }));

    // Auto-focus first input when this field has an error and is the current focus field
    useEffect(() => {
      if (!isClient) return;
      if (isFocused && hasError && !hasAutoFocusedRef.current) {
        const firstInput =
          datePickerRef.current?.querySelector<HTMLInputElement>(
            ".react-date-picker__inputGroup__input",
          );
        if (firstInput && document.activeElement !== firstInput) {
          firstInput.focus();
          hasAutoFocusedRef.current = true;
        }
      }
      if (!isFocused) {
        hasAutoFocusedRef.current = false;
      }
    }, [isFocused, hasError, isClient]);

    // Define the expected types (or import them from the library if available)
    type ValuePiece = Date | null;
    type DatePickerValue = ValuePiece | [ValuePiece, ValuePiece];

    const handleDatePickerChange = useCallback(
      (incomingValue: DatePickerValue) => {
        // 1. Safely extract a single Date, discarding any range arrays
        const newDate = Array.isArray(incomingValue)
          ? incomingValue[0]
          : incomingValue;

        setDisplayValue(newDate);

        if (newDate === null) {
          onChange(null);
          lastCommittedValueRef.current = null;
          return;
        }

        if (isDateSelectedFromCalendar) {
          onChange(newDate);
          lastCommittedValueRef.current = newDate;
          setIsCalendarOpen(false);
          setIsDateSelectedFromCalendar(false);

          datePickerRef.current
            ?.querySelector<HTMLInputElement>(
              ".react-date-picker__inputGroup__input:focus",
            )
            ?.blur();
        } else {
          const typedDate = parseInputGroupDate(datePickerRef.current);
          // 2. newDate is now guaranteed to be a single Date object here
          if (typedDate && typedDate.getTime() === newDate.getTime()) {
            onChange(newDate);
            lastCommittedValueRef.current = newDate;
          }
        }
      },
      [onChange, isDateSelectedFromCalendar],
    ); 

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key !== "Enter") return;
        event.preventDefault();

        const typedDate = parseInputGroupDate(datePickerRef.current);
        const dateToCommit = typedDate || displayValue;

        if (dateToCommit) {
          onChange(dateToCommit);
          lastCommittedValueRef.current = dateToCommit;
          setDisplayValue(dateToCommit);
        }

        setIsCalendarOpen(false);
        datePickerRef.current
          ?.querySelector<HTMLInputElement>(
            ".react-date-picker__inputGroup__input:focus",
          )
          ?.blur();

        onEnterPress?.(dateToCommit ?? null);
      },
      [displayValue, onChange, onEnterPress],
    );

    const handleInputChange = useCallback(() => {
      // Short timeout lets the DOM update before we read the inputs
      setTimeout(() => {
        const typedDate = parseInputGroupDate(datePickerRef.current);
        if (typedDate) {
          onChange(typedDate);
          lastCommittedValueRef.current = typedDate;
        }
      }, 50);
    }, [onChange]);

    const handleCalendarOpen = useCallback(() => setIsCalendarOpen(true), []);
    const handleCalendarClose = useCallback(() => {
      setIsCalendarOpen(false);
      setIsDateSelectedFromCalendar(false);
    }, []);

    const handleCalendarClick = useCallback((event: Event) => {
      const target = event.target as HTMLElement;
      if (
        target.closest(
          ".react-calendar__tile:not(.react-calendar__navigation button)",
        )
      ) {
        setIsDateSelectedFromCalendar(true);
      }
    }, []);

    const handleFocusEvent = useCallback(
      (event: React.FocusEvent) => onFocus?.(event),
      [onFocus],
    );

    const handleBlurEvent = useCallback(
      (event: React.FocusEvent) => {
        const related = event.relatedTarget as Node | null;
        const isStillWithin =
          related &&
          (datePickerRef.current?.contains(related) ||
            (related as HTMLElement).closest?.(".react-calendar"));

        if (isStillWithin) return;

        setIsCalendarOpen(false);
        setIsDateSelectedFromCalendar(false);

        const typedDate = parseInputGroupDate(datePickerRef.current);
        if (
          typedDate &&
          (!lastCommittedValueRef.current ||
            typedDate.getTime() !== lastCommittedValueRef.current.getTime())
        ) {
          onChange(typedDate);
          lastCommittedValueRef.current = typedDate;
          setDisplayValue(typedDate);
        }

        onBlur?.(event);
      },
      [onBlur, onChange],
    );

    // Attach calendar click listener when calendar opens
    useEffect(() => {
      if (!isClient || !isCalendarOpen) return;
      const calendar = document.querySelector(".react-calendar");
      if (!calendar) return;
      calendar.addEventListener("click", handleCalendarClick);
      return () => calendar.removeEventListener("click", handleCalendarClick);
    }, [isCalendarOpen, handleCalendarClick, isClient]);

    // Attach input change listeners to raw date inputs (react-date-picker doesn't
    // expose a native onChange for each segment)
    useEffect(() => {
      if (!isClient) return;
      const inputs = datePickerRef.current?.querySelectorAll<HTMLInputElement>(
        ".react-date-picker__inputGroup__input",
      );
      if (!inputs) return;

      inputs.forEach((input) => {
        input.addEventListener("input", handleInputChange);
        input.addEventListener("change", handleInputChange);
      });

      return () => {
        inputs.forEach((input) => {
          input.removeEventListener("input", handleInputChange);
          input.removeEventListener("change", handleInputChange);
        });
      };
    }, [handleInputChange, isClient]);

    const handleClearClick = useCallback(() => {
      setDisplayValue(null);
      onChange(null);
      lastCommittedValueRef.current = null;
    }, [onChange]);

    // ─── DYNAMIC STYLES ───────────────────────────────────────────────────────
    // Injected as a style tag because react-date-picker internals can't be
    // targeted via Tailwind or standard className props.

    const dividerColor = isClient && displayValue ? "#000000" : "#9CA3AF";
    const iconColor = isClient
      ? hasError && isFocused
        ? "#dc2626"
        : isFocused
          ? "#c7a652"
          : "#999999"
      : "#999999";
    const iconHoverColor =
      hasError && isFocused ? "#ef4444" : isFocused ? "#c7a652" : "#6B7280";
    const focusOutlineColor = hasError ? "#dc2626" : "#c7a652";

    const dateInputStyles = `
      .react-date-picker__inputGroup__input { outline: none !important; color: #000000 !important; }
      .react-date-picker__inputGroup__input:focus { outline: 2px solid ${focusOutlineColor} !important; border-radius: 2px !important; color: #000000 !important; }
      .react-date-picker__inputGroup__divider { color: ${dividerColor} !important; transition: color 0.2s ease !important; }
      .react-date-picker__inputGroup__input::placeholder { color: #9CA3AF !important; opacity: 1 !important; }
      .react-date-picker__calendar-button svg, .react-date-picker__clear-button svg { color: ${iconColor} !important; transition: color 0.2s ease !important; }
      .react-date-picker__calendar-button:hover svg, .react-date-picker__clear-button:hover svg { color: ${iconHoverColor} !important; }
      .react-date-picker__wrapper { height: 19px !important; align-items: center; border: none !important; }
      .react-date-picker__inputGroup { display: flex; align-items: center; }
      .react-date-picker__calendar { position: absolute !important; bottom: 44px !important; left: -2px !important; }
      .react-date-picker__button { padding: 0 !important; }
      .react-date-picker__calendar-button::before { content: 'Open calendar'; position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }
    `;

    return (
      <div
        className={themeConfig.datePickerContainer}
        ref={datePickerRef}
        data-field-name={name}
      >
        <style>{dateInputStyles}</style>
        <DatePicker
          value={displayValue || null}
          onChange={handleDatePickerChange}
          onBlur={handleBlurEvent}
          onFocus={handleFocusEvent}
          onKeyDown={handleKeyDown}
          onCalendarClose={handleCalendarClose}
          onCalendarOpen={handleCalendarOpen}
          isOpen={isCalendarOpen}
          dayPlaceholder={dayPlaceholder}
          monthPlaceholder={monthPlaceholder}
          yearPlaceholder={yearPlaceholder}
          format={format}
          className={themeConfig.datePicker}
          calendarIcon={
            <FaCalendarAlt
              className="text-[18px] transition-colors duration-200"
              aria-label="Open calendar"
            />
          }
          clearIcon={
            displayValue ? (
              <FaTimes
                className="min-w-[40px] text-[18px] transition-colors duration-200"
                onClick={handleClearClick}
                aria-label="Clear date"
              />
            ) : null
          }
          disabled={disabled}
          calendarAriaLabel="Choose date"
          {...props}
        />
      </div>
    );
  },
);

DateInput.displayName = "DateInput";
