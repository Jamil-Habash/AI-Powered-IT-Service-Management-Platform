import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Shell from "../components/Shell";
import { getCategories } from "../services/categoryService";
import { createTicket } from "../services/ticketService";
import usePageTitle from "../hooks/usePageTitle";

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function markdownToHtml(markdown) {
  return String(markdown || "")
    .split("\n")
    .map((line) => {
      if (/^\s*[-*]\s+/.test(line)) {
        return `<ul><li>${escapeHtml(line.replace(/^\s*[-*]\s+/, ""))}</li></ul>`;
      }
      if (line.trim()) {
        return `<p>${escapeHtml(line)
          .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
          .replace(/\*([^*]+)\*/g, "<em>$1</em>")
          .replace(/`([^`]+)`/g, "<code>$1</code>")}</p>`;
      }
      return "<p><br></p>";
    })
    .join("");
}

function htmlToMarkdown(root) {
  const serialize = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue;
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const content = Array.from(node.childNodes).map(serialize).join("");
    const tag = node.tagName.toLowerCase();
    if (tag === "strong" || tag === "b") return `**${content}**`;
    if (tag === "em" || tag === "i") return `*${content}*`;
    if (tag === "code") return `\`${content}\``;
    if (tag === "br") return "\n";
    if (tag === "li") return `- ${content}\n`;
    if (tag === "p" || tag === "div") return `${content}\n`;
    if (tag === "ul" || tag === "ol") return content;
    return content;
  };

  return Array.from(root.childNodes)
    .map(serialize)
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function CreateTicketPage() {
  usePageTitle("Create a support Ticket");
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const editorRef = useRef(null);
  const savedSelectionRef = useRef(null);

  useEffect(() => {
    const draft = localStorage.getItem("smartdesk_ticket_draft");
    if (!draft) return;
    try {
      const saved = JSON.parse(draft);
      setTitle(saved.title || "");
      setCategory(saved.category || "");
      setPriority(saved.priority || "MEDIUM");
      setDescription(saved.description || "");
      if (editorRef.current)
        editorRef.current.innerHTML = markdownToHtml(saved.description || "");
    } catch {
      localStorage.removeItem("smartdesk_ticket_draft");
    }
  }, []);

  const updateTitle = (value) => {
    setTitle(value);
    if (category) return;
    const lower = value.toLowerCase();
    const match = categories.find((item) => {
      const name = item.name.toLowerCase();
      return (
        (/(vpn|wifi|network|dns)/.test(lower) && /network|vpn/.test(name)) ||
        (/(monitor|dock|laptop|keyboard)/.test(lower) &&
          /hardware|peripheral|display/.test(name)) ||
        (/(password|login|sso|account)/.test(lower) &&
          /account|access|identity/.test(name))
      );
    });
    if (match) setCategory(String(match.id));
  };

  const saveDraft = () => {
    localStorage.setItem(
      "smartdesk_ticket_draft",
      JSON.stringify({ title, category, priority, description }),
    );
    setError("Draft saved locally on this device.");
  };

  useEffect(() => {
    getCategories()
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.content || [];
        setCategories(data);
      })
      .catch(() => setError("Unable to load ticket categories."))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!title || !category || !description) return;
    setError("");
    setLoading(true);
    try {
      const response = await createTicket(
        {
          title,
          description,
          categoryId: Number(category),
          priority,
        },
        files,
      );
      localStorage.removeItem("smartdesk_ticket_draft");
      navigate(`/ticket/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to submit ticket.");
    } finally {
      setLoading(false);
    }
  };

  const saveSelection = () => {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      savedSelectionRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    const range = savedSelectionRef.current;

    if (!selection || !range) return;

    selection.removeAllRanges();
    selection.addRange(range);
  };

  const runEditorCommand = (command, value = null) => {
    editorRef.current?.focus();

    restoreSelection();

    document.execCommand(command, false, value);

    if (editorRef.current) {
      setDescription(htmlToMarkdown(editorRef.current));
    }

    saveSelection();
  };

  const updateDescription = () => {
    if (editorRef.current) setDescription(htmlToMarkdown(editorRef.current));
  };

  const acceptFiles = (selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter(
      (file) => file.size <= 25 * 1024 * 1024,
    );
    if (validFiles.length !== selectedFiles.length) {
      setError("Each attachment must be 25 MB or smaller.");
    }
    setFiles((current) => [...current, ...validFiles]);
  };
  return (
    <Shell>
      <PageHeader
        eyebrow="SELF-SERVICE PORTAL  •  IT SUPPORT DESK"
        title="Create a Support Ticket"
        description="Submit a detailed request and our IT support team or automated assistants will assist you."
        action={
          <button
            className="secondary-button"
            onClick={() => navigate("/tickets")}
          >
            <Icon>arrow_back</Icon>Back to Tickets
          </button>
        }
      />
      <div className="content-grid">
        <form className="panel ticket-form" onSubmit={submit}>
          {error && <p className="form-error">{error}</p>}
          <h2>Ticket Details</h2>
          <p>
            Please provide clear details about the issue or request so we can
            route it quickly.
          </p>
          <label>
            Ticket Title
            <input
              value={title}
              onChange={(event) => updateTitle(event.target.value)}
              placeholder="Unable to connect to corporate VPN"
              required
            />
          </label>
          <div className="form-row">
            <label>
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
              >
                <option value="">
                  {categoriesLoading
                    ? "Loading categories..."
                    : "Select a category..."}
                </option>
                {categories.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {!categoriesLoading && !categories.length && !error && (
                <small>No categories are available yet.</small>
              )}
            </label>
            <label>
              Urgency & Impact
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>
          </div>
          <label>
            Description
            <div className="editor-toolbar" aria-label="Formatting tools">
              <button
                type="button"
                title="Bold"
                onMouseDown={(event) => {
                  saveSelection();
                  event.preventDefault();
                }}
                onClick={() => runEditorCommand("bold")}
              >
                <Icon>format_bold</Icon>
              </button>
              <button
                type="button"
                title="Bullet list"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => runEditorCommand("insertUnorderedList")}
              >
                <Icon>format_list_bulleted</Icon>
              </button>
              <button
                type="button"
                title="Code block"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => runEditorCommand("formatBlock", "pre")}
              >
                <Icon>code</Icon>
              </button>
            </div>
            <div
              id="ticket-description"
              ref={editorRef}
              className="description-editor"
              contentEditable
              role="textbox"
              aria-multiline="true"
              aria-label="Ticket description"
              data-placeholder="Describe the issue in detail..."
              onInput={updateDescription}
              onBlur={updateDescription}
              suppressContentEditableWarning
            />
            <input
              type="hidden"
              name="description"
              value={description}
              readOnly
            />
          </label>
          <label
            className={`upload ${isDragging ? "is-dragging" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              acceptFiles(event.dataTransfer.files);
            }}
          >
            <Icon>cloud_upload</Icon>Attach screenshots or logs
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.log,.txt,.csv,.doc,.docx"
              onChange={(event) => {
                acceptFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <small>
              {files.length
                ? `${files.length} file(s) attached. Click to add more.`
                : "PNG, JPG, PDF, LOG up to 25MB"}
            </small>
            {files.length > 0 && (
              <ul className="selected-files">
                {files.map((file, index) => (
                  <li key={`${file.name}-${index}`}>
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        setFiles((current) =>
                          current.filter((_, fileIndex) => fileIndex !== index),
                        );
                      }}
                      aria-label={`Remove ${file.name}`}
                    >
                      <Icon>close</Icon>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </label>
          <section className="triage-callout">
            <Icon>auto_awesome</Icon>
            <div>
              <strong>Smart Triage Active</strong>
              <p>
                We analyze the subject and description to route this request to
                the right support queue.
              </p>
            </div>
          </section>
          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={saveDraft}
            >
              Save Draft
            </button>
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Ticket"} <Icon>send</Icon>
            </button>
          </div>
        </form>
        <aside className="panel tips">
          <h2>Before Submitting</h2>
          {[
            "Check System Health",
            "Restart Device & Peripherals",
            "Explore Knowledge Base",
          ].map((tip, index) => (
            <div key={tip}>
              <b>{index + 1}</b>
              <span>
                <strong>{tip}</strong>
                <small>
                  Check our verified resolutions before raising a request.
                </small>
              </span>
            </div>
          ))}
        </aside>
      </div>
    </Shell>
  );
}
