import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------------- CORE CONFIG & STATE ------------------------
const genAI = new GoogleGenerativeAI("AIzaSyA31hP5ku0acmuO0OU7IqIiMnXEefo4Qs4");
const DEFAULT_MODEL = "gemini-2.5-flash";
const conversationHistory = new Map(); // sessionId -> [{ role, content }]

// ---------------------- CHAT HELPERS ------------------------
const CHAT_DATA = {
  greeting: {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
    response: "Hello! I'm Sanjeevani, your supportive AI wellness assistant. How can I assist you today?"
  },
  outside_scope: {
    keywords: ["diagnosis", "prescription", "treatment plan", "surgery", "what should i do", "what do i have"],
    response: "I can provide general wellness info. For medical advice, please consult a qualified healthcare professional."
  },
  default: {
    response: "I'm here to provide detailed information about wellness and health strategies. What would you like to know?"
  }
};

const getConversationContext = (sessionId) => conversationHistory.get(sessionId) || [];
const updateConversationContext = (sessionId, message, response) => {
  const history = getConversationContext(sessionId);
  history.push({ role: "user", content: message });
  history.push({ role: "model", content: response });
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

// ---------------------- MEDICATION HELPERS ------------------------
const formatScheduleList = (meds) => {
  if (!Array.isArray(meds) || meds.length === 0) return "No active medication schedules found.";
  return meds
    .map((m) => {
      const times = Array.isArray(m.times) ? m.times.join(", ") : m.times || "No specific times set";
      const dosage = m.dosage ?? "N/A";
      return `• Pill: ${m.pillName || "Unnamed"} | Dose: ${dosage} | Times: ${times}`;
    })
    .join("\n");
};

// ---------------------- ±7 DAY WINDOW LOGIC WITH STATUS ------------------------
const getMedsInWindow = (meds, now = new Date(), daysBefore = 7, daysAfter = 7) => {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dueMeds = [];
  const upcomingMeds = [];
  const pastMeds = [];

  meds.forEach((med) => {
    (med.times ?? []).forEach((t) => {
      const [hourStr, minStr] = t.split(":");
      const medMinutes = Number(hourStr) * 60 + Number(minStr);

      for (let i = -daysBefore; i <= daysAfter; i++) {
        const medDate = new Date(todayDate);
        medDate.setDate(medDate.getDate() + i);

        const diffMinutes = (medDate.getTime() - now.getTime()) / (1000 * 60) + (medMinutes - nowMinutes);

        let status = "Upcoming";
        if (diffMinutes < -5) status = "Missed";
        else if (diffMinutes >= -5 && diffMinutes <= 5) status = "Due Now";

        const medEntry = {
          pillName: med.pillName,
          dosage: med.dosage,
          time: t,
          date: medDate.toDateString(),
          status,
          diffMinutes,
        };

        if (diffMinutes < 0) pastMeds.push(medEntry);
        else if (diffMinutes <= daysAfter * 24 * 60) upcomingMeds.push(medEntry);

        if (diffMinutes >= -30 && diffMinutes <= 60) dueMeds.push(medEntry);
      }
    });
  });

  return { dueMeds, upcomingMeds, pastMeds };
};

// ---------------------- RULE-BASED FALLBACK ------------------------
const buildRuleBasedReply = (userQuery, healthData = {}) => {
  const meds = Array.isArray(healthData.medications) ? healthData.medications : [];
  if (!meds.length) return "You currently have no active medications. Please add them to track your doses.";

  const scheduleList = formatScheduleList(meds);
  const q = (userQuery || "").toLowerCase();

  if (q.includes("today") || q.includes("now") || q.includes("due") || q.includes("take today") || q.includes("take now")) {
    const { dueMeds } = getMedsInWindow(meds, new Date(), 0, 0);
    if (!dueMeds.length) return `No medications due now. Active schedules:\n\n${scheduleList}`;

    const lines = dueMeds.map(d => `• ${d.pillName || "Unnamed"} — Dose: ${d.dosage || "N/A"} — Scheduled at ${d.time}`);
    return `Medications due now or soon:\n\n${lines.join("\n")}`;
  }

  return `Your medication schedule:\n\n${scheduleList}`;
};

// ---------------------- GEMINI RESPONSE HELPERS ------------------------
const extractTextFromResult = (result) => {
  if (!result) return "";
  if (typeof result.text === "string" && result.text.trim().length > 0) return result.text.trim();
  const nested = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (nested) return nested.trim();
  return "";
};

// ---------------------- MAIN AI RESPONSE ------------------------
const buildSanjiPrompt = (healthData) => {
  const meds = Array.isArray(healthData.medications) ? healthData.medications : [];
  const scheduleList = formatScheduleList(meds);

  const lastDoseInfo = healthData.lastDoseLog?.medication
    ? `Last dose: ${healthData.lastDoseLog.medication.pillName} at ${new Date(healthData.lastDoseLog.createdAt).toLocaleString()}`
    : "No recent dose recorded.";

  const { dueMeds, upcomingMeds, pastMeds } = getMedsInWindow(meds, new Date(), 7, 7);

  const pastText = pastMeds
    .map(d => `• ${d.pillName} at ${d.time} — Status: ${d.status} on ${d.date}`)
    .join("\n") || "No doses in the past 7 days.";

  const upcomingText = upcomingMeds
    .map(d => `• ${d.pillName} at ${d.time} — Status: ${d.status} on ${d.date}`)
    .join("\n") || "No upcoming doses in the next 7 days.";

  return `
You are Sanjeevani, a smart, supportive AI medication assistant.

USER CONTEXT:
- Active medication schedule:
${scheduleList}

- Last dose logged:
${lastDoseInfo}

- Past 7 days doses:
${pastText}

- Next 7 days doses:
${upcomingText}

GUIDELINES:
1. List due/upcoming meds if user asks "what should I take now?".
2. Summarize taken/missed doses if user asks "missed and taken medicines".
3. List all meds if user asks "show my schedule" or "today's pills".
4. Keep replies concise, supportive, and actionable.
5. If no medications exist, respond: "You currently have no active medications. Please add them."
`;
};

const getAIResponse = async (userQuery, sessionId, healthData = {}) => {
  const predefined = findPredefinedResponse(userQuery);
  if (predefined !== CHAT_DATA.default.response) {
    updateConversationContext(sessionId, userQuery, predefined);
    return predefined;
  }

  const SANJEEVANI_PROMPT = buildSanjiPrompt(healthData);
  const history = getConversationContext(sessionId);
  const contents = [
    { role: "model", parts: [{ text: SANJEEVANI_PROMPT }] },
    ...history.map(turn => ({ role: turn.role === "user" ? "user" : "model", parts: [{ text: turn.content }] })),
    { role: "user", parts: [{ text: userQuery }] }
  ];

  if (!genAI) {
    const fallback = buildRuleBasedReply(userQuery, healthData);
    updateConversationContext(sessionId, userQuery, fallback);
    return fallback;
  }

  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
    const result = await model.generateContent({ contents });
    const aiText = extractTextFromResult(result);

    if (aiText) {
      updateConversationContext(sessionId, userQuery, aiText);
      return aiText;
    }

    const emptyFallback = buildRuleBasedReply(userQuery, healthData);
    updateConversationContext(sessionId, userQuery, emptyFallback);
    return emptyFallback;

  } catch (err) {
    const fallback = buildRuleBasedReply(userQuery, healthData);
    updateConversationContext(sessionId, userQuery, fallback);
    return fallback;
  }
};

export { getAIResponse };
