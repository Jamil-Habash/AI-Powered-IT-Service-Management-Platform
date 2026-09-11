function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return <span key={index}>{part}</span>;
  });
}

export default function MarkdownContent({ children }) {
  const lines = String(children || "").split("\n");
  const blocks = [];
  let list = [];
  let code = null;

  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={`list-${blocks.length}`}>
          {list.map((item, index) => <li key={index}>{renderInline(item)}</li>)}
        </ul>,
      );
      list = [];
    }
  };

  lines.forEach((line, index) => {
    if (line.trim() === "```") {
      flushList();
      if (code === null) code = [];
      else {
        blocks.push(<pre key={`code-${index}`}><code>{code.join("\n")}</code></pre>);
        code = null;
      }
      return;
    }
    if (code !== null) {
      code.push(line);
      return;
    }
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      list.push(bullet[1]);
      return;
    }
    flushList();
    blocks.push(
      line.trim() ? <p key={`line-${index}`}>{renderInline(line)}</p> : <div className="markdown-spacer" key={`space-${index}`} />,
    );
  });

  flushList();
  if (code !== null) blocks.push(<pre key={`code-${lines.length}`}><code>{code.join("\n")}</code></pre>);

  return <div className="markdown-content">{blocks}</div>;
}
