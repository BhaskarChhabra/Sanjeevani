import React, { useState } from "react";
import { generateMedicalSummary } from "../api"; 
import "./MedicalSummaryPage.css"; 

const MedicalSummaryPage = () => {
    const MAX_CHARS = 5010;
    
    const [text, setText] = useState(""); 
    const [category, setCategory] = useState("general");
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

    // --- LOGIC REMAINS UNCHANGED ---
    const handleGenerate = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setSummary(""); // Clear previous summary before loading
        try {
            const res = await generateMedicalSummary({ text, category }); 
            setSummary(res.data.summary);
        } catch (err) {
            console.error(err);
            // Provide a more specific error message in the summary box
            setSummary("<strong style='color: #ef4444;'>Error:</strong> Failed to generate summary. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = () => {
        setText("");
        setSummary("");
        setCategory("general");
    };

    return (
        <div className="medical-summary-container">
            <div className="header">
                <h1 className="title">AI Medical Summarizer</h1>
            </div>

            <div className="content-panels">
                {/* --- LEFT PANEL: INPUTS --- */}
                <div className="panel-card left-panel">
                    <div className="input-group">
                        <label>Select Medical Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="general">General Medical</option>
                            <option value="cardiology">Cardiology</option>
                            <option value="neurology">Neurology</option>
                            <option value="oncology">Oncology</option>
                            <option value="pediatrics">Pediatrics</option>
                        </select>
                    </div>

                    <div className="input-group text-area-group">
                        <div className="input-text-area-label">
                            <label>Paste Medical Text</label>
                            <span className="char-count">
                                {text.length}/{MAX_CHARS}
                            </span>
                        </div>
                        <textarea
                            rows={10}
                            value={text}
                            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                            placeholder="Enter patient notes, lab results, or any medical text..."
                        />
                    </div>
                    
                    <div className="button-container">
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !text.trim()}
                            className="generate-btn"
                        >
                            <span className="btn-icon">✨</span>
                            {loading ? "Analyzing..." : "Generate Summary"}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="delete-btn"
                            title="Clear all fields"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* --- RIGHT PANEL: OUTPUT --- */}
                <div className="panel-card right-panel">
                    {loading ? (
                        // 1. Display Loading Animation
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <h3>Analyzing Medical Text</h3>
                            <p>Our AI is processing the information to create a concise summary. This may take a moment.</p>
                        </div>
                    ) : summary.trim() ? (
                        // 2. Display Summary Content
                        <div className="summary-content">
                            <p dangerouslySetInnerHTML={{ 
                                __html: summary
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/\n/g, '<br />') 
                            }} />
                        </div>
                    ) : (
                        // 3. Display Empty State
                        <div className="empty-summary-state">
                            <span className="sparkle-icon">📄</span>
                            <h3>Your Summary Will Appear Here</h3>
                            <p>
                                Enter your medical text on the left and click "Generate Summary" to see the magic happen.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MedicalSummaryPage;
