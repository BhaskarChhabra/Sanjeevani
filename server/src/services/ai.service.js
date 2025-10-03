import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "../utils/ApiError.js";

// --- CORE CHATBOT CONFIGURATION & STATE ---
// Ensure GEMINI_API_KEY is loaded via dotenv in your main server file
const genAI = new GoogleGenerativeAI("AIzaSyA31hP5ku0acmuO0OU7IqIiMnXEefo4Qs4")
// Store conversation history for all users

const DEFAULT_MODEL = "gemini-2.5-flash"; // using gemini-2.5-flash as requested

/* ------------------------------- SDK Setup -------------------------------- */
// NOTE: if you're using a different Google SDK (e.g. @google/genai) change import / ctor accordingly.
// This matches your previous code which used @google/generative-ai

const conversationHistory = new Map(); // sessionId -> [ { role, content }, ... ]

/* ----------------------------- Chat helpers ------------------------------- */
const CHAT_DATA = {
  greeting: {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
    response:
      "Hello! I'm Sanjeevani, your supportive AI wellness assistant. I focus on general health, mental well-being, and lifestyle. How can I assist you on your wellness journey today?"
  },
  outside_scope: {
    keywords: ["diagnosis", "prescription", "treatment plan", "surgery", "what should i do", "what do i have"],
    response:
      "I can provide general wellness information, but I'm not a medical doctor. For any diagnosis, prescription, or specific medical advice, please consult a qualified healthcare professional. Can I offer you general guidance on self-care instead?"
  },
  default: {
    response:
      "I'm here to provide detailed information about wellness, mental well-being, and general health strategies. What specific information would you like to know about?"
  }
};

const getConversationContext = (sessionId) => conversationHistory.get(sessionId) || [];

export const getAdherencePrediction = async (healthData) => {
    console.log('[AI Service] Mock prediction running...');
    
    // For demonstration, we'll pretend the AI decides a nudge is needed.
    // In reality, this would involve a call to the Gemini API.
    const shouldNudge = true; 

    if (shouldNudge) {
        return {
            nudge: "Friendly reminder: Don't forget your upcoming dose! Staying on track is the key to feeling your best.",
            pattern: "No specific pattern detected, sending a general reminder." // The AI would provide a real reason here
        };
    } else {
        return {
            nudge: null, // No nudge needed
            pattern: null,
        };
    }
};
const updateConversationContext = (sessionId, message, response) => {
  const history = getConversationContext(sessionId);
  history.push({ role: "user", content: message });
  history.push({ role: "model", content: response });
  // keep last 40 entries (20 turns)
  conversationHistory.set(sessionId, history.slice(-40));
};

const findPredefinedResponse = (message) => {
  const lowercase = (message || "").toLowerCase();
  for (const [, data] of Object.entries(CHAT_DATA)) {
    if (data.keywords && data.keywords.some((kw) => lowercase.includes(kw.toLowerCase()))) {
      return data.response;
    }
  }
  return CHAT_DATA.default.response;
};

const formatScheduleList = (meds) => {
  if (!Array.isArray(meds) || meds.length === 0) return "No active medication schedules found in the database.";
  return meds
    .map((m) => {
      const times = Array.isArray(m.times) ? m.times.join(", ") : m.times || "No specific times set";
      const dosage = m.dosage ?? "N/A";
      return `• Pill: ${m.pillName || "Unnamed"} | Dose: ${dosage} | Times: ${times}`;
    })
    .join("\n");
};

/* --------------------------- Simple time helpers -------------------------- */
const parseTimeStringToMinutes = (s) => {
  if (!s || typeof s !== "string") return null;
  s = s.trim().toLowerCase();
  let m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    const hh = Number(m[1]), mm = Number(m[2]);
    if (hh >= 0 && hh < 24 && mm >= 0 && mm < 60) return hh * 60 + mm;
  }
  m = s.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (m) {
    let hh = Number(m[1]), mm = Number(m[2]);
    const ap = m[3].toLowerCase();
    if (ap === "pm" && hh !== 12) hh += 12;
    if (ap === "am" && hh === 12) hh = 0;
    if (hh >= 0 && hh < 24 && mm >= 0 && mm < 60) return hh * 60 + mm;
  }
  m = s.match(/^(\d{1,2})\s*(am|pm)$/i);
  if (m) {
    let hh = Number(m[1]); const ap = m[2].toLowerCase();
    if (ap === "pm" && hh !== 12) hh += 12;
    if (ap === "am" && hh === 12) hh = 0;
    return hh * 60;
  }
  return null;
};

const getDueMeds = (meds, windowBefore = 30, windowAfter = 60) => {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const due = [];
  if (!Array.isArray(meds) || meds.length === 0) return due;
  for (const med of meds) {
    const times = med.times ?? [];
    for (const t of times) {
      const minutes = parseTimeStringToMinutes(String(t));
      if (minutes === null) continue;
      const diff = minutes - nowMinutes;
      if (diff >= -windowBefore && diff <= windowAfter) {
        due.push({ med, time: t, diff });
        break;
      }
    }
  }
  return due;
};

/* ------------------------- Rule-based fallback reply ---------------------- */
const buildRuleBasedReply = (userQuery, healthData = {}) => {
  const meds = Array.isArray(healthData.medications) ? healthData.medications : [];
  if (!meds.length) {
    return "I can't check your schedule because you currently don't have any active medications listed in your profile. Please add a medication schedule first, and I'll be ready to help!";
  }

  const q = (userQuery || "").toLowerCase();
  const scheduleList = formatScheduleList(meds);

  if (q.includes("today") || q.includes("now") || q.includes("due") || q.includes("take today") || q.includes("take now")) {
    const due = getDueMeds(meds, 30, 60);
    if (!due.length) {
      return `No medications due at this time. Here are your active medication schedules:\n\n${scheduleList}\n\nIf you'd like a different window (e.g., upcoming today), ask "what pills do I need to take today?"`;
    }
    const lines = due.map((d) => `• ${d.med.pillName || "Unnamed"} — Dose: ${d.med.dosage || "N/A"} — Scheduled at ${d.time}`);
    return `Based on your schedule, these medications are due now or in the upcoming hour:\n\n${lines.join("\n")}\n\nIf you already took a dose, please log it so I can update your history.`;
  }

  // Default: show schedule
  return `I couldn't reach the AI service, so here's your medication schedule from stored data:\n\n${scheduleList}\n\nIf you want me to only show today's or upcoming medications, ask "what pills do I need to take today?"`;
};

/* -------------------------- SDK extraction helper ------------------------- */
const extractTextFromResult = (result) => {
  // Different SDK shapes: try common locations
  if (!result) return "";
  if (typeof result.text === "string" && result.text.trim().length > 0) return result.text.trim();
  // nested shape: result.response.candidates[0].content.parts[0].text
  const nested = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (nested && typeof nested === "string" && nested.trim().length > 0) return nested.trim();
  // another fallback shape: result?.candidates...
  const alt = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (alt && typeof alt === "string" && alt.trim().length > 0) return alt.trim();
  return "";
};

/* --------------------------- Main exported fn ----------------------------- */
/**
 * getAIResponse(userQuery, sessionId, healthData)
 * - Hardcoded GEMINI_API_KEY and DEFAULT_MODEL used (no process.env)
 * - Uses role "model" for the system instruction and "user" for user messages (Gemini 2.5 valid roles)
 */
const getAIResponse = async (userQuery, sessionId, healthData = {}) => {
  // 1) Predefined replies
  const predefined = findPredefinedResponse(userQuery);
  if (predefined !== CHAT_DATA.default.response) {
    updateConversationContext(sessionId, userQuery, predefined);
    return predefined;
  }

  // 2) Build schedule text + system/model "instruction" block (use role: "model")
  const scheduleList = formatScheduleList(healthData.medications || []);
  const lastDoseInfo = healthData.lastDoseLog && healthData.lastDoseLog.medication
    ? `Pill: ${healthData.lastDoseLog.medication.pillName} | Time: ${new Date(healthData.lastDoseLog.createdAt).toLocaleString()}`
    : "No recent log found.";

  const SANJEEVANI_SCHEDULE_INSTRUCTION = `
You are Sanjeevani, a concise and supportive medication reminder assistant.
ACTIVE SCHEDULES LIST:
${scheduleList}

LAST DOSE TAKEN:
${lastDoseInfo}

CURRENT TIME: ${new Date().toLocaleString()}

GUIDELINES:
- If the user asks "what pills do I need to take today" or similar, list pills + times and highlight any due now/upcoming.
- If there are no active schedules, respond: "I can't check your schedule because you currently don't have any active medications listed in your profile. Please add a medication schedule first, and I'll be ready to help!"
- Keep answers concise and actionable.
`;

  // 3) Build contents array using allowed roles: "model" for the instruction and "user" for the user message.
  // Also include conversationHistory (already stored with roles "user"/"model") — we map them directly.
  const history = getConversationContext(sessionId);
  const contents = [];

  // instruction as 'model' role (Gemini 2.5 accepts 'model' role)
  contents.push({
    role: "model",
    parts: [{ text: SANJEEVANI_SCHEDULE_INSTRUCTION }]
  });

  // Map previous history entries into contents
  for (const turn of history) {
    // turn.role should be 'user' or 'model' (we stored these previously)
    const role = (turn.role === "user") ? "user" : "model";
    contents.push({
      role,
      parts: [{ text: turn.content }]
    });
  }

  // final user message
  contents.push({
    role: "user",
    parts: [{ text: userQuery }]
  });

  // 4) If SDK / key isn't configured, fallback straight away
  if (!genAI) {
    const fallback = buildRuleBasedReply(userQuery, healthData);
    updateConversationContext(sessionId, userQuery, fallback);
    return fallback;
  }

  // 5) Call Gemini 2.5 Flash (wrapped in try/catch)
  try {
    // getGenerativeModel returns model instance that has generateContent
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    // Call generateContent with the contents array (Gemini expects { contents: [...] })
    const result = await model.generateContent({ contents });

    // Extract the text safely
    const aiText = extractTextFromResult(result);

    if (aiText && aiText.length > 0) {
      updateConversationContext(sessionId, userQuery, aiText);
      return aiText;
    }

    // empty response -> fallback to rule-based reply
    const emptyFallback = buildRuleBasedReply(userQuery, healthData);
    updateConversationContext(sessionId, userQuery, emptyFallback);
    return emptyFallback;
  } catch (err) {
    // log full error for debugging
    console.error("❌ GoogleGenerativeAI Error in Sanjeevani service:", err?.message ?? err, err);

    // If Gemini fails, return deterministic fallback (useful for dev & UX)
    const fallback = buildRuleBasedReply(userQuery, healthData);
    updateConversationContext(sessionId, userQuery, fallback);
    return fallback;
  }
};

export { getAIResponse };