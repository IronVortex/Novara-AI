import { useState } from "react";

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>{className?.replace("language-", "") || "code"}</span>
        <button type="button" onClick={handleCopy}>{copied ? "Copied" : "Copy"}</button>
      </div>
      <pre>
        <code className={className}>{children}</code>
      </pre>
      <div className="code-run-ui">
        <span>Execution preview</span>
        <button type="button" disabled title="Sandbox execution coming soon">
          Run code
        </button>
      </div>
    </div>
  );
}

export default CodeBlock;
