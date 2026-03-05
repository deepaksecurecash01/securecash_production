/**
 * Returns today's date formatted as DD/MM/YYYY (Sydney local time via server).
 */
export const getCurrentDate = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Returns the current date and time formatted as DD/MM/YYYY HH:MM:SS.
 */
export const getCurrentDateTime = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Formats a callback date value into a human-readable Australian date string.
 * Accepts a Date object, an ISO string, or a DD/MM/YYYY string.
 * Returns "Not requested" for null, undefined, or unparseable values.
 */
export const formatCallbackDate = (
  callbackDate: Date | string | null | undefined,
): string => {
  if (!callbackDate) return "Not requested";

  try {
    let date: Date;

    if (callbackDate instanceof Date) {
      date = callbackDate;
    } else {
      // Handle DD/MM/YYYY format which new Date() cannot parse reliably
      if (callbackDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = callbackDate.split("/");
        date = new Date(`${month}/${day}/${year}`);
      } else {
        date = new Date(callbackDate);
      }
    }

    if (isNaN(date.getTime())) return "Not requested";

    return date.toLocaleDateString("en-AU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting callback date:", error);
    return "Not requested";
  }
};

/**
 * Normalises a field that may arrive as a string, an array, null, or undefined
 * into a single display string.
 *
 * - Arrays: joined with ", "; empty arrays return "No schedule - special event."
 * - Strings: trimmed; empty strings return "Not specified"
 * - null / undefined: returns "Not specified"
 */
export const formatArrayField = (
  field: string | string[] | null | undefined,
): string => {
  if (field === null || field === undefined) {
    return "Not specified";
  }

  if (Array.isArray(field)) {
    const validItems = field
      .filter((item) => item !== null && item !== undefined && item !== "")
      .map((item) => (typeof item === "string" ? item.trim() : String(item)))
      .filter((item) => item !== "");

    if (validItems.length === 0) {
      return "No schedule - special event.";
    }

    return validItems.join(", ");
  }

  // typeof field === 'string' — the only remaining branch
  const trimmed = field.trim();
  return trimmed || "Not specified";
};

/**
 * Validates an email address string.
 *
 * Checks:
 * - Non-empty string
 * - Basic RFC-compliant format via regex
 * - Max length of 254 characters
 * - No leading/trailing dots, consecutive dots, or multiple @ symbols
 */
export const isValidEmail = (email: string): boolean => {
  // Guard empty string — parameter is typed string so typeof check is redundant
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmedEmail = email.trim().toLowerCase();

  if (!emailRegex.test(trimmedEmail)) return false;
  if (trimmedEmail.length > 254) return false;

  const invalidPatterns = [/^\./, /\.$/, /\.\./, /@.*@/];
  return !invalidPatterns.some((pattern) => pattern.test(trimmedEmail));
};

/**
 * Sanitizes a filename for safe use in the filesystem or as an email attachment name.
 * Replaces illegal characters and whitespace with underscores, collapses runs,
 * strips leading/trailing underscores, and truncates to 255 characters.
 */
export const sanitizeFilename = (filename: string): string => {
  // Guard empty string — parameter is typed string so typeof check is redundant
  if (!filename) return "unknown_file";

  return filename
    .trim()
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 255);
};
