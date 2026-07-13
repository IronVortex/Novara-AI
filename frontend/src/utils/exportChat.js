export const exportMarkdownFile = (markdown, title = "novara-chat") => {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.md`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportPdfFile = async (messages, title = "Novara Chat") => {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  let y = 14;

  doc.setFontSize(16);
  doc.text(title, 14, y);
  y += 10;

  doc.setFontSize(11);
  for (const message of messages) {
    const label = message.role === "user" ? "You" : "Novara";
    const lines = doc.splitTextToSize(`${label}: ${message.content}`, 180);
    if (y + lines.length * 6 > 280) {
      doc.addPage();
      y = 14;
    }
    doc.text(lines, 14, y);
    y += lines.length * 6 + 4;
  }

  doc.save(`${title.replace(/\s+/g, "-").toLowerCase()}.pdf`);
};

export const copyConversation = async (messages = []) => {
  const text = messages
    .map((message) => `${message.role === "user" ? "You" : "Novara"}: ${message.content}`)
    .join("\n\n");
  await navigator.clipboard.writeText(text);
  return text;
};
