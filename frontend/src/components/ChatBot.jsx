import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";
import { chatWithAI } from "../services/chatBotService";

const STORAGE_KEY = "smartdesk_chat_history";
const CONV_KEY = "smartdesk_chat_conversation_id";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedId = localStorage.getItem(CONV_KEY);
    if (saved) setMessages(JSON.parse(saved));
    if (savedId) setConversationId(savedId);
  }, []);

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
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!user) return null;

  const welcomeMessage =
    "Hello! I'm SmartDesk AI Assistant. How can I help you with your IT issue today?";

  const startConversation = () => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: welcomeMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
    setIsOpen(true);
  };

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
      const summary = messages.map((m) => `${m.role}: ${m.content}`).join("\n");

      const firstUserMessage =
        messages.find((m) => m.role === "user")?.content ||
        "IT Support Request";

      navigate("/create-ticket", {
        state: {
          aiChatContext: {
            conversationId,
            summary,
            suggestedTitle: firstUserMessage.slice(0, 80),
          },
        },
      });
      setIsOpen(false);
    } else if (action.action === "view_article") {
      navigate(`/knowledge-base/${action.data?.articleId}`);
      setIsOpen(false);
    }
  };

  const createTicketNow = () => {
    const summary = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
    const firstUserMessage =
      messages.find((m) => m.role === "user")?.content || "IT Support Request";

    navigate("/create-ticket", {
      state: {
        aiChatContext: {
          conversationId,
          summary,
          suggestedTitle: firstUserMessage.slice(0, 80),
        },
      },
    });
    setIsOpen(false);
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONV_KEY);
  };

  const isOnChatPage =
    location.pathname === "/ai/chat" ||
    location.pathname === `/ai/chat/${conversationId}`;

  if (isOnChatPage) return null;

  return (
    <div className="chatbot-widget">
      <button
        type="button"
        className={`chatbot-toggle ${isOpen ? "open" : ""}`}
        onClick={() => {
          if (!isOpen) startConversation();
          setIsOpen(!isOpen);
        }}
        aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
      >
        {isOpen ? (
          <Icon>close</Icon>
        ) : (
          <>
            <Icon>robot</Icon>
            <span className="chatbot-badge" />
          </>
        )}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <Icon>robot</Icon>
              <div>
                <strong>SmartDesk AI Assistant</strong>
                <small>Online</small>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                type="button"
                className="chatbot-header-button"
                onClick={() => navigate("/chat")}
                title="Open full chat"
              >
                <Icon>open_in_full</Icon>
              </button>
              <button
                type="button"
                className="chatbot-header-button"
                onClick={clearChat}
                title="Clear conversation"
              >
                <Icon>delete_sweep</Icon>
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
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
              placeholder={loading ? "AI is thinking..." : "Ask a question..."}
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
      )}
    </div>
  );
}
