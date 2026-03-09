// Debounced username check to avoid excessive API calls
let checkTimeout: NodeJS.Timeout | null = null;
let abortController: AbortController | null = null;

interface UsernameAvailabilityResult {
  available: boolean;
  tooShort?: boolean;
  error?: boolean;
}

export const checkUsernameAvailability = async (
  username: string,
): Promise<UsernameAvailabilityResult> => {
  // Abort previous request if still pending
  if (abortController) {
    abortController.abort();
  }

  // Clear previous timeout
  if (checkTimeout) {
    clearTimeout(checkTimeout);
  }

  // Return promise that resolves after debounce
  return new Promise((resolve) => {
    checkTimeout = setTimeout(async () => {
      try {
        // Skip check if username too short
        if (!username || username.length < 4) {
          resolve({ available: true, tooShort: true });
          return;
        }

        // Create new abort controller for this request
        const controller = new AbortController();
        abortController = controller;

        // PATCH: Add 5-second timeout for better UX
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch("/api/check-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
          signal: controller.signal,
        });

        // Clear timeout if request completes
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn("Username API returned non-OK status:", response.status);
          // On error, allow (fail-open)
          resolve({ available: true, error: true });
          return;
        }

        const data = await response.json();
        resolve(data);
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (err.name === "AbortError") {
          console.warn("Username check timed out or was aborted");
          resolve({ available: true, error: true });
          return;
        }

        console.error("Username check error:", error);
        resolve({ available: true, error: true });
      }
    }, 800);
  });
};

interface ValidationResult {
  valid: boolean;
  message: string;
}

// Synchronous username format validation
export const validateUsernameFormat = (username: string): ValidationResult => {
  // Must be 4-50 characters — matches InductionFormSchema min(4) and API skip threshold.
  if (username.length < 4 || username.length > 50) {
    return { valid: false, message: "Username must be 4-50 characters" };
  }

  // Only letters, numbers, underscore, hyphen
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(username)) {
    return {
      valid: false,
      message: `Only letters, numbers, "_" and "-" allowed`,
    };
  }

  return { valid: true, message: "" };
};

// Cancel any pending checks (useful for cleanup)
export const cancelUsernameCheck = () => {
  if (checkTimeout) {
    clearTimeout(checkTimeout);
    checkTimeout = null;
  }
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
};
