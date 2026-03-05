interface DeviceInfo {
  fullUserAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
}

interface BrowserPattern {
  name: string;
  pattern: RegExp;
}

interface OsPattern {
  name: string;
  pattern: RegExp;
  format: (v: string) => string;
  condition?: boolean;
}

export const getDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent;

  let browser = "Unknown";
  let browserVersion = "";

  const browserPatterns: BrowserPattern[] = [
    { name: "Chrome", pattern: /Chrome\/([0-9.]+)/ },
    { name: "Firefox", pattern: /Firefox\/([0-9.]+)/ },
    { name: "Safari", pattern: /Version\/([0-9.]+).*Safari/ },
    { name: "Edge", pattern: /Edge\/([0-9.]+)/ },
  ];

  for (const { name, pattern } of browserPatterns) {
    const match = userAgent.match(pattern);
    if (match) {
      browser = name;
      browserVersion = match[1];
      break;
    }
  }

  let os = "Unknown";

  const osPatterns: OsPattern[] = [
    {
      name: "Windows NT",
      pattern: /Windows NT ([0-9._]+)/,
      format: (v) => `Windows NT ${v}`,
    },
    {
      name: "Mac OS X",
      pattern: /Mac OS X ([0-9._]+)/,
      format: (v) => `Mac OS X ${v.replace(/_/g, ".")}`,
    },
    {
      name: "Android",
      pattern: /Android ([0-9.]+)/,
      format: (v) => `Android ${v}`,
    },
    {
      name: "iOS",
      pattern: /OS ([0-9._]+)/,
      format: (v) => `iOS ${v.replace(/_/g, ".")}`,
      condition: /iPhone|iPad/.test(userAgent),
    },
    {
      name: "Linux",
      pattern: /Linux/,
      format: () => "Linux",
    },
  ];

  for (const { pattern, format, condition } of osPatterns) {
    if (condition === false) continue;
    const match = userAgent.match(pattern);
    if (match) {
      os = format(match[1] ?? "");
      break;
    }
  }

  return {
    fullUserAgent: userAgent,
    browser,
    browserVersion,
    os,
  };
};



const getOrdinalSuffix = (day: number): string => {
  if (day === 1 || day === 21 || day === 31) return "st";
  if (day === 2 || day === 22) return "nd";
  if (day === 3 || day === 23) return "rd";
  return "th";
};

export const formatSubmissionDate = (): string => {
  const now = new Date();

  const datePart = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Inject ordinal suffix into the numeric day
  const withOrdinal = datePart.replace(/(\d+)/, (match) => {
    const day = parseInt(match);
    return `${day}${getOrdinalSuffix(day)}`;
  });

  const timePart = now.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  return `${withOrdinal}, ${timePart}`;
};

export const formatDateForAPI = (date: string | Date | undefined): string => {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatBirthdayForAPI = (
  date: string | Date | undefined,
): string => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}/${month}/${year}`;
};

export interface FormMetadata {
  formType: string;
  timestamp: string;
  formId: string;
  submissionId: string;
  "IP Address": string;
  Device: string;
  Browser: string;
  "Operating System": string;
  dateOfSubmission: string;
}

export const prepareFormMetadata = (
  formType: string,
  formId: string,
): FormMetadata => {
  const deviceInfo = getDeviceInfo();
  const submissionDate = formatSubmissionDate();

  return {
    formType,
    timestamp: new Date().toISOString(),
    formId,
    submissionId: `${formType}_${Date.now()}`,
    "IP Address": "collected server-side",
    Device: deviceInfo.fullUserAgent,
    Browser: `${deviceInfo.browser} ${deviceInfo.browserVersion}`,
    "Operating System": deviceInfo.os,
    dateOfSubmission: submissionDate,
  };
};