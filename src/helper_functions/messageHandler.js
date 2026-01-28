import i18n from "../multiLingual";   // ← IMPORTANT: use your file

/**
 * Get message based on current language and API response
 */
export const getApiMessage = (response, fallback = "An error occurred") => {
  if (!response) return fallback;

  const currentLang = i18n.language || "en";

  // Spanish
  if (currentLang === "es" && response.message_es) {
    return response.message_es;
  }

  // English
  if (currentLang === "en" && response.message_en) {
    return response.message_en;
  }

  // Default backend message
  if (response.message) {
    return response.message;
  }

  return fallback;
};

/**
 * Wrapper for toast usage
 */
export const showToast = (toastFn, response, fallback) => {
  const msg = getApiMessage(response, fallback);
  toastFn(msg);
};
