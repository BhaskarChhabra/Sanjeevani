import React, { useState, useRef, useEffect } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { askAI, saveChatHistory, getChatHistory } from '../api';
//import ProfileDropdown from '../ui/ProfileDropdown';
//import SubscriptionPlanSwitcherButton from '../chat/subscription/SubscriptionPlanSwitcherButton';

const HEADER_HEIGHT = 60; // px

// --- Theme Colors Based on SanJeevani Image ---
const THEME_ACCENT = '#6A5ACD'; // A deep indigo/royal purple, similar to the user chat bubble
const DARK_MODE_BACKGROUND = '#0A0A1F'; // Very dark blue/indigo background
const AI_MESSAGE_BACKGROUND = '#2C2C4B'; // Slightly lighter background for AI messages
const USER_TEXT_COLOR = 'white';
const AI_TEXT_COLOR = 'white'; // White text on dark background

const getMessageStyle = (sender) => ({
    padding: '12px 16px',
    borderRadius: '18px',
    maxWidth: '75%',
    marginBottom: '12px',
    // Positioning
    marginLeft: sender === 'User' ? 'auto' : '10px',
    marginRight: sender === 'User' ? '10px' : 'auto',
    // Theme Colors
    backgroundColor: sender === 'User' ? THEME_ACCENT : AI_MESSAGE_BACKGROUND,
    color: sender === 'User' ? USER_TEXT_COLOR : AI_TEXT_COLOR,
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)', // Slightly stronger shadow for contrast
    fontSize: '15px',
    lineHeight: '1.4'
});

const AIChatPage = ({ userId }) => {
    const [messages, setMessages] = useState([]);
    const [inputQuery, setInputQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [darkMode, setDarkMode] = useState(true); // Defaulting to true as the app image is dark mode

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(scrollToBottom, [messages]);

    // Dark mode setup (like ChatLayout)
    useEffect(() => {
        // Load preference, but default to dark mode based on the provided image
        const savedDarkMode = localStorage.getItem('darkMode');
        const initialDarkMode = savedDarkMode !== null ? savedDarkMode === 'true' : true;
        setDarkMode(initialDarkMode);
        document.documentElement.classList.toggle('dark', initialDarkMode);
    }, []);
    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        localStorage.setItem('darkMode', !darkMode);
    };

    // Load previous chat history (unchanged logic)
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const response = await getChatHistory(userId);
                if (response.data.success && response.data.chats.length > 0) {
                    setMessages(response.data.chats[0].messages);
                } else {
                    setMessages([
                        { sender: 'AI', text: "Hello! I am the Mystic Fortune Teller. Ask me anything about your schedule or adherence history!" }
                    ]);
                }
            } catch (err) {
                console.error("Failed to load chat history:", err);
                setMessages([
                    { sender: 'AI', text: "Hello! I am the Mystic Fortune Teller. Ask me anything about your schedule or adherence history!" }
                ]);
            }
        };
        loadHistory();
    }, [userId]);

    // Handle Send (unchanged logic)
    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputQuery.trim()) return;

        const userMessage = { sender: 'User', text: inputQuery.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInputQuery('');
        setIsLoading(true);

        try {
            const response = await askAI({ query: userMessage.text });
            const aiText = response.data.data.answer || "Sorry, I couldn't process that. Try again.";
            setMessages(prev => [...prev, { sender: 'AI', text: aiText }]);
        } catch (err) {
            console.error("AI request failed:", err);
            setMessages(prev => [...prev, { sender: 'AI', text: "Connection error. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle New Chat (unchanged logic)
    const handleNewChat = async () => {
        if (messages.length > 0) {
            setStatusMessage("Saving current chat history...");
            try {
                const saveResult = await saveChatHistory({ userId, messages });
                setStatusMessage(saveResult.data.success ? "History saved. Starting a new chat." : "Save failed, but starting new chat anyway.");
            } catch (err) {
                console.error("Failed to save chat:", err);
                setStatusMessage("Error saving history, starting new chat.");
            }
        }

        setMessages([
            { sender: 'AI', text: "Starting a fresh session. Ask me anything about your schedule or adherence history!" }
        ]);
        setInputQuery('');
        setTimeout(() => setStatusMessage(''), 3000);
    };

    // Handle Export Chat (unchanged logic)
    const handleExportChat = () => {
        if (!messages.length) return;
        const chatText = messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
        const filename = `chat_history_${new Date().toISOString()}.txt`;
        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        // Update dark:bg-gray-900 to the very dark theme color
        <div className={`chat-layout-page fixed inset-0 flex flex-col md:flex-row h-screen min-h-screen overflow-hidden ${darkMode ? 'dark:bg-['+DARK_MODE_BACKGROUND+']' : 'bg-white'}`}>
            {/* Main container */}
            {/* Update dark:bg-gray-800 to be the dark theme color, or a slightly lighter shade if needed */}
            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full border rounded-xl shadow-sm bg-white dark:bg-['+DARK_MODE_BACKGROUND+'] overflow-hidden">
                
                {/* Header */}
                {/* Ensure header background matches the dark theme and uses a white text color */}
                <header className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-gray-700 dark:border-gray-700 bg-white/95 dark:bg-['+DARK_MODE_BACKGROUND+']/95 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Mystic Fortune Teller 🔮</h2>
                    <div className="flex items-center space-x-2">
                        {/* You'll need to ensure your Button component uses THEME_ACCENT for its primary style in dark mode */}
                        <Button onClick={handleNewChat} className="bg-['+THEME_ACCENT+'] hover:bg-['+THEME_ACCENT+'] text-white">New Chat</Button>
                        <Button onClick={handleExportChat} className="bg-['+THEME_ACCENT+'] hover:bg-['+THEME_ACCENT+'] text-white">Export Chat</Button>
                        {/* <ProfileDropdown darkMode={darkMode} toggleDarkMode={toggleDarkMode} /> */}
                    </div>
                </header>

                {/* Status message */}
                {statusMessage && (
                    <div className="p-2 bg-green-900 text-green-300 text-center">{statusMessage}</div>
                )}

                {/* Chat messages */}
                <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-2" style={{ paddingTop: HEADER_HEIGHT + 16, backgroundColor: darkMode ? DARK_MODE_BACKGROUND : 'white' }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={getMessageStyle(msg.sender)}>
                            <strong>{msg.sender}:</strong> {msg.text}
                        </div>
                    ))}
                    <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{isLoading && "*Thinking..."}</p>
                    <div ref={messagesEndRef} />
                </main>

                {/* Input bar */}
                {/* Ensure input bar background matches the dark theme color */}
                <form onSubmit={handleSend} className="sticky bottom-0 z-20 flex p-4 gap-2 border-t border-gray-700 dark:border-gray-700" style={{ backgroundColor: darkMode ? DARK_MODE_BACKGROUND : 'white' }}>
                    <Input
                        type="text"
                        value={inputQuery}
                        onChange={(e) => setInputQuery(e.target.value)}
                        placeholder="Ask about your pills, schedule, or adherence..."
                        className={`flex-1 ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' : ''}`}
                        disabled={isLoading}
                    />
                    {/* Ensure Send button uses the accent color */}
                    <Button type="submit" disabled={isLoading} className="bg-['+THEME_ACCENT+'] hover:bg-['+THEME_ACCENT+'] text-white">Send</Button>
                </form>
            </div>
        </div>
    );
};

export default AIChatPage;