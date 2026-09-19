import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Icon from "../components/Icon";
import Shell from "../components/Shell";
import {
  chatWithAI,
  getChatConversations,
  getChatHistory,
} from "../services/chatBotService";
import usePageTitle from "../hooks/usePageTitle";
import aiLogo from "../assets/AI_logo.png";
import aiSmartLogo from "../assets/AI_smartdesk.png";

const STORAGE_KEY = "smartdesk_chat_history";
const CONV_KEY = "smartdesk_chat_conversation_id";
const STARTER_PROMPTS = [
  {
    icon: "wifi",
    title: "Troubleshoot connectivity",
    prompt:
      "My internet connection is not working. Can you help me troubleshoot it?",
  },
  {
    icon: "vpn_key",
    title: "Reset my access",
    prompt: "I need help resetting my account access. What should I do?",
  },
  {
    icon: "computer",
    title: "Report a device issue",
    prompt: "My work device is having an issue. Help me diagnose it.",
  },
];

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
  const [conversations, setConversations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
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

  const showChatHistory = async () => {
    setHistoryError("");
    setConversations([]);
    setIsHistoryOpen(true);

    setHistoryLoading(true);
    try {
      const response = await getChatConversations();
      setConversations(response.data);
    } catch (_err) {
      setHistoryError("Unable to load your conversations. Please try again.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const openConversation = async (selectedConversationId) => {
    setHistoryError("");
    setHistoryLoading(true);

    try {
      const response = await getChatHistory(selectedConversationId);
      setMessages(
        response.data.map((message) => ({
          ...message,
          role: message.role.toLowerCase(),
          timestamp: message.createdAt,
        })),
      );
      setConversationId(selectedConversationId);
      setIsHistoryOpen(false);
      inputRef.current?.focus();
    } catch (_err) {
      setHistoryError("Unable to open this conversation. Please try again.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONV_KEY);
  };

  const getDisplayMessages = () => {
    return messages.filter((m) => m.role !== "system");
  };

  const displayMessages = getDisplayMessages();
  const hasMessages = displayMessages.length > 0;

  return (
    <Shell>
      <div className="assistant-workspace">
        <header className="assistant-toolbar">
          <div className="assistant-identity">
            <span className="assistant-mark" aria-hidden="true">
              <img src={aiSmartLogo} alt="" />
            </span>
          </div>
          <div className="assistant-toolbar-actions">
            <button
              type="button"
              className="assistant-icon-button"
              onClick={showChatHistory}
              title="Chat history"
              aria-label="Chat history"
            >
              <Icon>history</Icon>
            </button>
            <button
              type="button"
              className="assistant-icon-button"
              onClick={clearChat}
              title="Start a new chat"
              aria-label="Start a new chat"
            >
              <Icon>edit_square</Icon>
            </button>
          </div>
        </header>

        <div
          className={`assistant-thread ${hasMessages ? "has-messages" : ""}`}
        >
          {!hasMessages && (
            <div className="assistant-welcome">
              <span className="assistant-welcome-icon" aria-hidden="true">
                <img src={aiLogo} alt="" />
              </span>
              <p className="assistant-welcome-kicker">SMARTDESK AI</p>
              <h2>How can I help today?</h2>
              <p>
                Describe an IT problem, ask for troubleshooting steps, or get
                ready to create a support ticket.
              </p>
              <div className="assistant-starters">
                {STARTER_PROMPTS.map((starter) => (
                  <button
                    key={starter.title}
                    type="button"
                    className="assistant-starter"
                    onClick={() => {
                      setInput(starter.prompt);
                      inputRef.current?.focus();
                    }}
                  >
                    <Icon>{starter.icon}</Icon>
                    <span>{starter.title}</span>
                    <Icon>arrow_outward</Icon>
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasMessages && (
            <div className="assistant-message-list">
              {displayMessages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.role} ${message.isError ? "error" : ""}`}
                >
                  {message.role === "assistant" && (
                    <span className="message-avatar" aria-hidden="true">
                      <img src={aiLogo} alt="" />
                    </span>
                  )}
                  <div>
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
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="message assistant typing">
              <span className="message-avatar" aria-hidden="true">
                <img src={aiLogo} alt="" />
              </span>
              <div className="message-content">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="assistant-composer-wrap">
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
          <p className="assistant-composer-note">
            SmartDesk AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>

      {isHistoryOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setIsHistoryOpen(false)}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-history-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">AI ASSISTANT</p>
                <h2 id="chat-history-title">Chat History</h2>
              </div>
              <button
                type="button"
                className="chatbot-input-button"
                onClick={() => setIsHistoryOpen(false)}
                aria-label="Close chat history"
              >
                <Icon>close</Icon>
              </button>
            </div>

            <div className="conversation-history-list">
              {historyLoading && (
                <p className="modal-lead">Loading history...</p>
              )}
              {historyError && <p className="form-error">{historyError}</p>}
              {!historyLoading &&
                !historyError &&
                conversations.length === 0 && (
                  <p className="modal-lead">
                    You do not have any saved conversations yet.
                  </p>
                )}
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={`conversation-history-item ${String(conversation.id) === String(conversationId) ? "active" : ""}`}
                  onClick={() => openConversation(conversation.id)}
                >
                  <span className="conversation-history-icon">
                    <Icon>chat_bubble</Icon>
                  </span>
                  <span className="conversation-history-copy">
                    <strong>{conversation.title}</strong>
                    <small>
                      {conversation.updatedAt
                        ? new Date(conversation.updatedAt).toLocaleString()
                        : "Saved conversation"}
                    </small>
                  </span>
                  <Icon>chevron_right</Icon>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </Shell>
  );
}
