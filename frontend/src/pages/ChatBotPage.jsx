import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Shell from "../components/Shell";
import { chatWithAI } from "../services/chatBotService";
import usePageTitle from "../hooks/usePageTitle";

const STORAGE_KEY = "smartdesk_chat_history";
const CONV_KEY = "smartdesk_chat_conversation_id";

function loadInitialState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const savedId = localStorage.getItem(CONV_KEY);
  return {
    messages: saved ? JSON.parse(saved) : [],
    conversationId: savedId || null,
  };
}

export default function ChatPage() {
  usePageTitle("AI Assistant");
  const location = useLocation();
  const navigate = useNavigate();

  const [messages, setMessages] = useState(() => loadInitialState().messages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(
    () => loadInitialState().conversationId,
  );
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const initialState = location.state?.aiChatContext;

  useEffect(() => {
    if (initialState?.summary) {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (existing.length === 0) {
        setMessages([
          {
            id: "existing",
            role: "system",
            content: `Previous conversation summary:\n${initialState.summary}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    }
  }, [initialState?.summary]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    if (conversationId) {
      localStorage.setItem(CONV_KEY, conversationId);
    }
  }, [messages, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const welcomeMessage =
    "Hello! I'm SmartDesk AI Assistant. How can I help you with your IT issue today?";

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatWithAI(input.trim(), conversationId);
      const data = response.data;

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply || "I didn't understand that. Could you rephrase?",
        suggestedActions: data.suggestedActions || [],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (_err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "I'm having trouble connecting to the AI service. Please try again in a moment.",
          isError: true,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAction = (action) => {
    if (action.action === "create_ticket") {
      const summary = messages
        .filter((m) => m.role !== "system")
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      const firstUserMessage =
        messages.find((m) => m.role === "user")?.content ||
        "IT Support Request";

      navigate("/create-ticket", {
        state: {
          aiChatContext: {
            conversationId,
            summary,
            suggestedTitle:
              initialState?.suggestedTitle || firstUserMessage.slice(0, 80),
          },
        },
      });
    } else if (action.action === "view_article") {
      navigate(`/knowledge-base/${action.data?.articleId}`);
    }
  };

  const createTicketNow = () => {
    const summary = messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    navigate("/create-ticket", {
      state: {
        aiChatContext: {
          conversationId,
          summary,
          suggestedTitle: input || "IT Support Request",
        },
      },
    });
  };

  const getChatHistory = () => {
    navigate(`/ai/chat/${conversationId}`);
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONV_KEY);
  };

  const getDisplayMessages = () => {
    if (messages.length === 0) {
      return [
        {
          id: "welcome",
          role: "assistant",
          content: welcomeMessage,
          timestamp: new Date().toISOString(),
        },
      ];
    }
    return messages.filter((m) => m.role !== "system");
  };

  const displayMessages = getDisplayMessages();

  return (
    <Shell>
      <PageHeader
        eyebrow="AI ASSISTANT"
        title="SmartDesk AI Assistant"
        description="Ask me about IT issues, troubleshooting, or create a support ticket."
        action={
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" className="danger-button" onClick={clearChat}>
              <Icon>delete_sweep</Icon>Clear Chat
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={getChatHistory}
            >
              <Icon>history</Icon>Chat History
            </button>
          </div>
        }
      />
      <div className="chat-page">
        <div className="chatbot-messages">
          {displayMessages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role} ${message.isError ? "error" : ""}`}
            >
              <div className="message-content">{message.content}</div>
              {message.suggestedActions &&
                message.suggestedActions.length > 0 && (
                  <div className="message-actions">
                    {message.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        type="button"
                        className="action-chip"
                        onClick={() => handleAction(action)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}

          {loading && (
            <div className="message assistant typing">
              <div className="message-content">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-input-area">
          <button
            type="button"
            className="chatbot-input-button"
            onClick={createTicketNow}
            title="Escalate to a human agent"
          >
            <Icon>error</Icon>
          </button>
          <textarea
            ref={inputRef}
            className="chatbot-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              loading
                ? "AI is thinking..."
                : "Ask a question about your IT issue..."
            }
            disabled={loading}
            rows={1}
          />
          <button
            type="button"
            className="chatbot-send"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <Icon>send</Icon>
          </button>
        </div>
      </div>
    </Shell>
  );
}
