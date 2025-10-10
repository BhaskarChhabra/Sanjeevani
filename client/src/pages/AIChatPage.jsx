"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { askAI, saveChatHistory, getChatById } from "../api"; // keep your API utilities

/* =========================
   THEME & SMALL UTILITIES
   ========================= */
const THEME_ACCENT = "#9370DB";
const LIGHT_MODE_BACKGROUND = "#FFFFFF";
const AI_MESSAGE_BACKGROUND = "#F2F2F4";
const USER_TEXT_COLOR = "#FFFFFF";
const AI_TEXT_COLOR = "#222";

/* =========================
   Small local Button & Input
   - These forward props (style, className, onClick, etc.)
   - Prevents unexpected "parent property inheritance"
   ========================= */
const Button = ({ children, type = "button", disabled = false, style = {}, className = "", onClick, ...rest }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        border: "none",
        outline: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "8px 14px",
        borderRadius: "10px",
        backgroundColor: THEME_ACCENT,
        color: "white",
        fontWeight: 600,
        fontSize: 14,
        transition: "opacity .15s ease, transform .08s ease",
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder = "", type = "text", disabled = false, style = {}, ...rest }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: "24px",
        border: `2px solid ${THEME_ACCENT}`,
        fontSize: 15,
        outline: "none",
        boxSizing: "border-box",
        backgroundColor: "white",
        ...style,
      }}
      {...rest}
    />
  );
};

/* =========================
   Avatars & Message bubble
   ========================= */
const AIAvatar = () => (
  <div style={{
    width: 36, height: 36, borderRadius: 18, backgroundColor: "white",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "1px solid #e6e6e6", flexShrink: 0
  }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AI_TEXT_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-1.1 0-2 .9-2 2s.9 2 2 2h2v-4zM21 16h2c1.1 0 2-.9 2-2s-.9-2-2-2h-2v4zM7 21v-4H3v4h4zM17 19h4v-4h-4v4zM10 4h4v16h-4V4zM12 2v2M12 20v2"/></svg>
  </div>
);

const UserAvatar = () => (
  <div style={{
    width: 36, height: 36, borderRadius: 18, backgroundColor: THEME_ACCENT,
    color: "white", fontSize: 16, fontWeight: 700, display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0
  }}>B</div>
);

const getMessageStyle = (sender) => ({
  padding: "12px 16px",
  borderRadius: 20,
  borderTopLeftRadius: sender === "AI" ? 6 : 20,
  borderTopRightRadius: sender === "User" ? 6 : 20,
  maxWidth: "calc(100% - 90px)",
  backgroundColor: sender === "User" ? THEME_ACCENT : AI_MESSAGE_BACKGROUND,
  color: sender === "User" ? USER_TEXT_COLOR : AI_TEXT_COLOR,
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  fontSize: 15,
  lineHeight: 1.4,
  wordBreak: "break-word",
});

/* Message bubble component */
const MessageBubble = ({ sender, text }) => {
  const isUser = sender === "User";
  const avatar = isUser ? <UserAvatar /> : <AIAvatar />;

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: isUser ? "flex-end" : "flex-start",
      gap: 12,
      marginBottom: 16,
      width: "100%",
    }}>
      {!isUser && (
        <>
          {avatar}
          <div style={getMessageStyle(sender)}>{text}</div>
        </>
      )}
      {isUser && (
        <>
          <div style={getMessageStyle(sender)}>{text}</div>
          {avatar}
        </>
      )}
    </div>
  );
};

/* =========================
   Main Chat Page
   ========================= */
const AIChatPage = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  // responsive state
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isMobile = width <= 600;

  // CSS var for input height (used in padding-bottom)
  const inputHeight = isMobile ? 64 : 76; // px

  // scroll to bottom helper
  const scrollToBottom = (behavior = "smooth") => {
    try { messagesEndRef.current?.scrollIntoView({ behavior, block: "end" }); } catch (e) { /* ignore */ }
  };

  useEffect(scrollToBottom, [messages]);

  // load chat history
  useEffect(() => {
    const loadChat = async () => {
      try {
        if (sessionId) {
          const response = await getChatById(sessionId);
          const loadedMessages = Array.isArray(response.data.messages)
            ? response.data.messages
            : response.data.messages
              ? [response.data.messages]
              : [];
          setMessages(
            loadedMessages.length
              ? loadedMessages
              : [{ sender: "AI", text: "Hello! I am the Mystic Fortune Teller. Ask me anything about your schedule or adherence history!" }]
          );
        } else {
          setMessages([{ sender: "AI", text: "Hello! I am the Mystic Fortune Teller. Ask me anything about your schedule or adherence history!" }]);
        }
      } catch (err) {
        console.error("Failed to load chat:", err);
        setMessages([{ sender: "AI", text: "Hello! I am the Mystic Fortune Teller. Ask me anything about your schedule or adherence history!" }]);
      }
    };
    loadChat();
  }, [sessionId]);

  // send message
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputQuery.trim()) return;

    const userMessage = { sender: "User", text: inputQuery.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputQuery("");
    setIsLoading(true);

    // scroll a bit to show the user message before AI reply arrives
    setTimeout(() => scrollToBottom("smooth"), 50);

    try {
      const response = await askAI({ query: userMessage.text, sessionId });
      const aiText = (response && response.data && (response.data.data?.answer ?? response.data.answer)) || "Sorry, I couldn't process that. Try again.";
      setMessages(prev => [...prev, { sender: "AI", text: aiText }]);
    } catch (err) {
      console.error("AI request failed:", err);
      setMessages(prev => [...prev, { sender: "AI", text: "Connection error. Please try again later." }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollToBottom("smooth"), 50);
    }
  };

  // New chat (save history)
  const handleNewChat = async () => {
    if (messages.length > 0) {
      setStatusMessage("Saving current chat history...");
      try {
        const saveResult = await saveChatHistory({ userId, messages, sessionId });
        setStatusMessage(saveResult?.data?.success ? "History saved. Starting a new chat." : "Save failed, but starting new chat anyway.");
      } catch (err) {
        console.error("Failed to save chat:", err);
        setStatusMessage("Error saving history, starting new chat.");
      }
    }

    setMessages([{ sender: "AI", text: "Starting a fresh session. Ask me anything about your schedule or adherence history!" }]);
    setInputQuery("");
    setTimeout(() => setStatusMessage(""), 2500);
    setTimeout(() => scrollToBottom("auto"), 100);
  };

  // Export chat
  const handleExportChat = () => {
    if (!messages.length) return;
    const chatText = messages.map((m) => `${m.sender}: ${m.text}`).join("\n");
    const filename = `chat_history_${new Date().toISOString()}.txt`;
    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Focus behavior: if input focuses, make sure we scroll to bottom (useful on mobile)
  const inputRef = useRef(null);
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onFocus = () => setTimeout(() => scrollToBottom("smooth"), 120);
    el.addEventListener("focus", onFocus);
    return () => el.removeEventListener("focus", onFocus);
  }, []);

  /* =========================
     JSX & styles
     - We use CSS variables for input height padding
     - Media queries inside a <style> block to adjust small-screen layout
     ========================= */
  return (
    <div style={{ backgroundColor: LIGHT_MODE_BACKGROUND, minHeight: "100vh", display: "flex", justifyContent: "center", padding: 0, ["--input-height"]: `${inputHeight}px` }}>
      <style>{`
        /* Chat window (centered) */
        .chat-window {
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          position: relative;
          box-shadow: 0 0 10px rgba(0,0,0,0.06);
          background: white;
        }

        header.chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
          position: sticky;
          top: 0;
          z-index: 120;
          background: white;
        }

        .status-banner {
          padding: 8px;
          background-color: #f6ffed;
          color: #52c41a;
          text-align: center;
          border-bottom: 1px solid #d9f7be;
        }

        main.chat-main {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          /* reserve space for input: input-height var + small margin */
          padding-bottom: calc(var(--input-height, 76px) + 28px);
          -webkit-overflow-scrolling: touch;
        }

        /* Fixed input bar centered for desktop */
        .fixed-input {
          position: fixed;
          bottom: 12px;
          left: 58.5%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 900px;
          padding: 12px 20px;
          z-index: 130;
          display: flex;
          gap: 10px;
          align-items: center;
          box-shadow: 0 6px 20px rgba(0,0,0,0.06);
          background: white;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.03);
        }

        /* smaller screens: pin to edges with margins (no translateX) */
        @media (max-width: 600px) {
          .fixed-input {
            left: 12px;
            right: 12px;
            transform: none;
            max-width: none;
            width: calc(100% - 24px);
            padding: 10px;
            bottom: 12px;
            border-radius: 12px;
          }
        }

        /* keep chat content nicely spaced from top header */
        .header-title {
          font-size: 18px;
          font-weight: 700;
          color: ${THEME_ACCENT};
        }

        /* small helper for send-icon vs text */
        .send-icon { display: none; }
        @media (max-width: 600px) {
          .send-text { display: none; }
          .send-icon { display: inline-flex; }
        }
      `}</style>

      <div className="chat-window" style={{ boxSizing: "border-box" }}>
        {/* Header */}
        <header className="chat-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2 className="header-title" style={{ margin: 0 }}>Mystic Fortune Teller 🔮</h2>
            <div style={{ color: "#666", fontSize: 13 }}>Session: {sessionId ?? "local"}</div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={handleNewChat} style={{ backgroundColor: THEME_ACCENT }}>New Chat</Button>
            <Button onClick={handleExportChat} style={{ backgroundColor: THEME_ACCENT }}>Export Chat</Button>
          </div>
        </header>

        {/* Status */}
        {statusMessage && <div className="status-banner">{statusMessage}</div>}

        {/* Messages */}
        <main className="chat-main" role="log" aria-live="polite">
          {messages.map((m, i) => <MessageBubble key={i} sender={m.sender} text={m.text} />)}
          {isLoading && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 8 }}>
              <AIAvatar />
              <div style={{ alignSelf: "center", fontStyle: "italic", color: THEME_ACCENT }}>*Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Input Bar (fixed) */}
        <form
          onSubmit={handleSend}
          className="fixed-input"
          style={{
            // ensure this inline style won't be overridden and allow external style prop merging
            boxSizing: "border-box",
            // the following var is used by CSS for padding-bottom
            ["--input-height"]: `${inputHeight}px`,
          }}
        >
          <Input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about your pills, schedule, or adherence..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: isMobile ? "12px 14px" : "12px 18px",
              borderRadius: 24,
            }}
            aria-label="Message input"
          />

          <Button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            aria-label="Send message"
            style={{
              padding: isMobile ? "10px" : "10px 16px",
              borderRadius: 999,
              minWidth: isMobile ? 44 : 88,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {/* icon on mobile, text on desktop */}
            <span className="send-icon" aria-hidden>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/></svg>
            </span>
            <span className="send-text">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AIChatPage;
