
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./Assistant.css";

const welcomeMessage = {
    role: "assistant",
    content: `# Welcome to Career OS AI! 👋

I'm your personal career assistant.

I can help you with:
- Career guidance and learning roadmaps
- Java and Spring Boot
- Resume improvement
- Interview preparation
- Job search strategies

**What would you like help with today?**`
};

function Assistant({ user }) {
    const [messages, setMessages] = useState([welcomeMessage]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [error, setError] = useState("");
    const [historyStatus, setHistoryStatus] = useState("");
    const [clearing, setClearing] = useState(false);

    const messagesEndRef = useRef(null);
    const userId = user?.id;

    // Load saved messages from MySQL
    const loadHistory = useCallback(async () => {
        if (!userId) {
            setError("User ID not found. Please log in again.");
            return;
        }

        setHistoryLoading(true);
        setError("");
        setHistoryStatus("");

        try {
            console.log("Loading chat history for user:", userId);

            const response = await fetch(
                `http://localhost:8080/api/ai/history/${userId}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to load chat history."
                );
            }

            if (!Array.isArray(data)) {
                throw new Error("Invalid chat history response.");
            }

            console.log("Chat history received:", data.length);

            if (data.length > 0) {
                setMessages(
                    data.map(item => ({
                        id: item.id,
                        role: item.role,
                        content: item.content
                    }))
                );

                setHistoryStatus(
                    `${data.length} saved messages loaded successfully.`
                );

            } else {
                setMessages([welcomeMessage]);
                setHistoryStatus("No saved chat messages found.");
            }

        } catch (err) {
            console.error("History loading error:", err);
            setError(err.message);

        } finally {
            setHistoryLoading(false);
        }
    }, [userId]);

    // Automatically load history when assistant opens
    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // Scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, loading]);

    // Send message to Gemini
    const sendMessage = async (e) => {
        e.preventDefault();

        const message = input.trim();

        if (!message || loading || !userId) return;

        setMessages(previous => [
            ...previous,
            { role: "user", content: message }
        ]);

        setInput("");
        setLoading(true);
        setError("");
        setHistoryStatus("");

        try {
            const response = await fetch(
                "http://localhost:8080/api/ai/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: Number(userId),
                        message: message
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "AI request failed."
                );
            }

            setMessages(previous => [
                ...previous,
                {
                    role: "assistant",
                    content: data.reply
                }
            ]);

            setHistoryStatus("Conversation saved successfully.");

        } catch (err) {
            setError(err.message || "Unable to connect to AI.");
        } finally {
            setLoading(false);
        }
    };

    // Clear chat history
    const clearChat = async () => {
        if (!userId || clearing || loading) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete your entire chat history?"
        );

        if (!confirmed) return;

        setClearing(true);
        setError("");
        setHistoryStatus("");

        try {
            const response = await fetch(
                `http://localhost:8080/api/ai/history/${userId}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to clear chat history."
                );
            }

            setMessages([welcomeMessage]);
            setHistoryStatus("Chat history cleared successfully.");

        } catch (err) {
            setError(err.message);

        } finally {
            setClearing(false);
        }
    };

    return (
        <div className="assistant-page">

            {/* Header */}
            <div className="assistant-heading">

                <div>
                    <span className="assistant-eyebrow">
                        YOUR PERSONAL AI GUIDE
                    </span>

                    <h1>AI Career Assistant</h1>

                    <p>
                        Your career conversations, saved in one place.
                    </p>
                </div>

                <div className="assistant-heading-actions">

                    <div className="assistant-status">
                        <span></span>
                        AI Assistant
                    </div>

                    <button
                        type="button"
                        className="view-history-button"
                        onClick={loadHistory}
                        disabled={historyLoading || loading}
                    >
                        {historyLoading
                            ? "Loading..."
                            : "↻ View History"}
                    </button>

                    <button
                        type="button"
                        className="clear-chat-button"
                        onClick={clearChat}
                        disabled={clearing || loading || historyLoading}
                    >
                        {clearing ? "Clearing..." : "Clear Chat"}
                    </button>

                </div>
            </div>

            {/* Chat Container */}
            <div className="assistant-chat">

                <div className="chat-messages">

                    {historyLoading ? (
                        <div className="chat-loading">
                            Loading your previous conversations...
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={message.id || index}
                                className={`chat-message ${message.role}`}
                            >

                                <div className="chat-avatar">
                                    {message.role === "user" ? "U" : "AI"}
                                </div>

                                <div className="chat-bubble">

                                    {message.role === "assistant" ? (
                                        <ReactMarkdown>
                                            {message.content}
                                        </ReactMarkdown>
                                    ) : (
                                        message.content
                                    )}

                                </div>

                            </div>
                        ))
                    )}

                    {loading && (
                        <div className="chat-message assistant">
                            <div className="chat-avatar">AI</div>

                            <div className="chat-bubble typing">
                                Thinking...
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef}></div>

                </div>

                {historyStatus && (
                    <div className="history-status">
                        {historyStatus}
                    </div>
                )}

                {error && (
                    <div className="chat-error">
                        {error}
                    </div>
                )}

                {/* Input */}
                <form
                    className="chat-input-area"
                    onSubmit={sendMessage}
                >

                    <input
                        type="text"
                        placeholder="Ask anything about your career..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading || historyLoading || !userId}
                    />

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            historyLoading ||
                            !input.trim() ||
                            !userId
                        }
                    >
                        {loading ? "..." : "Send ↑"}
                    </button>

                </form>

                <p className="assistant-disclaimer">
                    Your conversations are saved in your Career OS account.
                </p>

            </div>
        </div>
    );
}

export default Assistant;
