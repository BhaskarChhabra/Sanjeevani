"use client"

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getChatById } from "../api";

// Theme colors
const PRIMARY_PURPLE = "#805ad5";
const ACCENT_PURPLE = "#9f7aea";
const LIGHT_BG = "#f9f9fb";
const WHITE = "#ffffff";
const TEXT_DARK = "#333";

const ChatSessionPage = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await getChatById(chatId);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId]);

  return (
    <div style={{ padding: "2rem", fontFamily: "'Inter', sans-serif", background: LIGHT_BG, minHeight: "100vh" }}>
      {loading ? (
        <p style={{ textAlign: "center", color: TEXT_DARK }}>Loading chat...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                background: msg.sender === "user" ? PRIMARY_PURPLE : WHITE,
                color: msg.sender === "user" ? WHITE : TEXT_DARK,
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                maxWidth: "70%",
                boxShadow: msg.sender === "user" ? "0 4px 8px rgba(128, 90, 213, 0.3)" : "0 2px 5px rgba(0,0,0,0.05)",
              }}
            >
              {msg.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatSessionPage;
