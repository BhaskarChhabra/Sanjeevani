import React, { useState, useEffect, useCallback } from "react";
import { getChatHistory } from "../api";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

// --- THEME & STYLES ---
const styles = {
    pageContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#f9fafb',
        fontFamily: 'Inter, sans-serif',
        color: '#1f2937',
    },
    header: {
        padding: '2rem 3rem 1.5rem',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        flexShrink: 0,
    },
    pageTitle: {
        fontSize: '1.8rem',
        fontWeight: '700',
        margin: '0 0 0.25rem 0',
    },
    pageSubtitle: {
        fontSize: '1rem',
        color: '#6b7280',
        margin: 0,
    },
    actionBar: {
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        padding: '1.5rem 3rem',
        flexShrink: 0,
    },
    searchInputWrapper: {
        position: 'relative',
        flexGrow: 1,
    },
    searchIcon: {
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#9ca3af',
        pointerEvents: 'none',
    },
    searchInput: {
        width: '100%',
        padding: '0.75rem 1rem 0.75rem 3rem',
        borderRadius: '0.5rem',
        border: '1px solid #d1d5db',
        outline: 'none',
        fontSize: '1rem',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
    },
    actionButtons: {
        display: 'flex',
        gap: '1rem',
        flexShrink: 0,
    },
    refreshButton: {
        backgroundColor: '#ffffff',
        color: '#4b5563',
        border: '1px solid #d1d5db',
        padding: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.5rem',
        fontWeight: '600',
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'background-color 0.2s, transform 0.1s',
    },
    newChatButton: {
        backgroundColor: '#5b21b6',
        color: '#ffffff',
        padding: '0.75rem 1.25rem',
        gap: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.5rem',
        fontWeight: '600',
        fontSize: '0.9rem',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s, transform 0.1s',
    },
    chatListContainer: {
        flexGrow: 1,
        overflowY: 'auto',
        padding: '0 3rem 2rem',
    },
    card: {
        background: '#ffffff',
        borderRadius: '0.75rem',
        padding: '1.25rem 1.5rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'flex-start',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        cursor: 'pointer',
    },
    cardContent: {
        flexGrow: 1,
        marginRight: '1rem',
    },
    cardTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#1f2937',
        margin: '0 0 0.3rem 0',
    },
    cardLastMessage: {
        fontSize: '0.9rem',
        color: '#6b7280',
        margin: '0 0 0.75rem 0',
        lineHeight: 1.5,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
    },
    cardMeta: {
        fontSize: '0.8rem',
        color: '#9ca3af',
        margin: 0,
    },
    deleteButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#9ca3af',
        padding: '0.25rem',
        borderRadius: '50%',
        transition: 'color 0.2s, background-color 0.2s',
    },
    centeredState: {
        textAlign: 'center',
        padding: '4rem 1rem',
        color: '#6b7280',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    spinner: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        marginBottom: '1rem',
        border: '4px solid #e5e7eb',
        borderTopColor: '#8b5cf6',
        animation: 'spin 1s ease-in-out infinite',
    },
};

// Keyframes need to be injected into the document head
const keyframes = `
@keyframes spin {
    to { transform: rotate(360deg); }
}
`;

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); 
};

const processChatData = (rawChats) => {
    if (!rawChats || rawChats.length === 0) return [];
    return rawChats.map(chat => {
        const firstUserMessage = chat.messages.find(msg => msg.sender === "user");
        const firstMessageText = firstUserMessage?.text || chat.messages[0]?.text;
        const lastMessageObj = chat.messages[chat.messages.length - 1];
        const derivedTitle = firstMessageText
            ? (firstMessageText.length > 50 ? firstMessageText.substring(0, 50) + "..." : firstMessageText)
            : "Untitled Chat";
        const fullText = chat.messages.map(m => m.text).join(" ");
        return {
            _id: chat._id,
            title: derivedTitle,
            lastMessage: lastMessageObj?.text || "",
            messageCount: chat.messages.length,
            updatedAt: chat.updatedAt || chat.createdAt,
            tags: [],
            fullText, 
        };
    });
};

const ChatHistoryPage = () => {
    const { user } = useAuthStore((state) => state);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const fetchHistory = useCallback(async () => {
        if (!user?._id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await getChatHistory(user._id);
            const processedHistory = processChatData(res.data.chats || []);
            setHistory(processedHistory);
        } catch (error) {
            console.error("Failed to fetch chat history:", error);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        // Inject keyframes for animations
        const styleSheet = document.createElement("style");
        styleSheet.innerText = keyframes;
        document.head.appendChild(styleSheet);
        
        fetchHistory();

        return () => {
            document.head.removeChild(styleSheet);
        }
    }, [fetchHistory]);

    const handleNavigateToChat = (chatId) => {
        navigate(`/ai-chat${chatId !== "new" ? `?sessionId=${chatId}` : ""}`);
    };

    const handleDeleteSession = (sessionId) => {
        if (window.confirm("Are you sure you want to delete this conversation?")) {
            setHistory(prev => prev.filter(session => session._id !== sessionId));
            // TODO: call backend API to delete session
        }
    };

    const filteredHistory = history.filter(session => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;
        return (session.fullText || "").toLowerCase().includes(query);
    });

    const ChatSessionCard = ({ session }) => (
        <div 
            style={styles.card} 
            onClick={() => handleNavigateToChat(session._id)}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                e.currentTarget.style.borderColor = "#c4b5fd";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                e.currentTarget.style.borderColor = "#e5e7eb";
            }}
        >
            <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{session.title || "Untitled Chat"}</h3>
                <p style={styles.cardLastMessage}>{session.lastMessage}</p>
                <p style={styles.cardMeta}>
                    {session.messageCount} messages • {formatDate(session.updatedAt)}
                </p>
            </div>
            <button
                style={styles.deleteButton}
                onClick={(e) => { e.stopPropagation(); handleDeleteSession(session._id); }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        </div>
    );

    return (
        <div style={styles.pageContainer}>
            <header style={styles.header}>
                <h1 style={styles.pageTitle}>Your Conversations</h1>
                <p style={styles.pageSubtitle}>View, search, and manage your past conversations.</p>
            </header>

            <div style={styles.actionBar}>
                <div style={styles.searchInputWrapper}>
                    <svg style={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={styles.searchInput}
                        onFocus={(e) => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.2)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; }}
                    />
                </div>
                <div style={styles.actionButtons}>
                    <button style={styles.refreshButton} onClick={fetchHistory} title="Refresh history">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.44 14a8 8 0 0 0 12.56 3.12l1.6-1.6"></path><path d="M20.56 10a8 8 0 0 0-12.56-3.12l-1.6 1.6"></path></svg>
                    </button>
                    <button style={styles.newChatButton} onClick={() => handleNavigateToChat("new")}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        New Chat
                    </button>
                </div>
            </div>

            <main style={styles.chatListContainer}>
                {loading ? (
                    <div style={styles.centeredState}>
                        <div style={{...styles.spinner, animation: 'spin 1s ease-in-out infinite'}}></div>
                        <p>Loading chat history...</p>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div style={styles.centeredState}>
                        <p>No conversations found.</p>
                    </div>
                ) : (
                    filteredHistory.map(session => <ChatSessionCard key={session._id} session={session} />)
                )}
            </main>
        </div>
    );
};

export default ChatHistoryPage;

