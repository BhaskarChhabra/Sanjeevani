import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractTextFromResult } from "./aiHelpers.js"; // keep this helper file

// ✅ Your existing API key and model
const genAI = new GoogleGenerativeAI("AIzaSyA31hP5ku0acmuO0OU7IqIiMnXEefo4Qs4");
const DEFAULT_MODEL = "gemini-2.5-flash";

export const generateMedicalSummary = async (req, res) => {
  const { text, category } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ success: false, message: "No text provided" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    // ✅ The prompt instruction (same as before)
    const instruction = `
You are a medical information summarizer AI.
Category: ${category || "general"}
Summarize the following text concisely with key insights, symptoms, causes, treatment, and prevention if applicable.
Keep it structured and easy to read.
Text:
${text}
`;

    // ❌ WRONG: role: "model"
    // ✅ FIXED: use role: "user"
    const contents = [
      {
        role: "user",
        parts: [{ text: instruction }],
      },
    ];

    // ✅ Generate content using Gemini
    const result = await model.generateContent({ contents });

    // ✅ Extract text properly
    const summary = extractTextFromResult(result);

    res.json({ success: true, summary });
  } catch (err) {
    console.error("❌ Gemini Error in MedicalSummary:", err?.message ?? err);
    res
      .status(500)
      .json({ success: false, message: err?.message || "Failed to generate summary" });
  }
};
