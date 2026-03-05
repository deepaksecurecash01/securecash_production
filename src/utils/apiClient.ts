export const submitForm = async <T>(
  formData: T,
  endpoint = "/api/forms",
): Promise<unknown> => {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: string };
      throw new Error(errorData.error || "Failed to submit the form");
    }

    return await response.json();
  } catch (error: unknown) {
    console.error("API submission error:", error);
    throw error;
  }
};
