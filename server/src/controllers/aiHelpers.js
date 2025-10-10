// safely extract text from Gemini API result
export const extractTextFromResult = (result) => {
  if (!result) return "";

  // first try common top-level text
  if (typeof result.text === "string" && result.text.trim().length > 0) {
    return result.text.trim();
  }

  // try nested structure (Gemini API sometimes returns candidates)
  const nested =
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (nested && typeof nested === "string") return nested.trim();

  return "";
};
