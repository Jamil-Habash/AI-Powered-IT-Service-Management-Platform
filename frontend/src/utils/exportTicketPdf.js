import jsPDF from "jspdf";

export function exportTicketPdf(ticket, comments) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.text(`SmartDesk Ticket #${ticket.id}`, 14, y);
  y += 10;

  doc.setFontSize(11);
  doc.text(`Title: ${ticket.title}`, 14, y); y += 7;
  doc.text(`Status: ${ticket.status}    Priority: ${ticket.priority}`, 14, y); y += 7;
  doc.text(`Category: ${ticket.categoryName || "Uncategorized"}`, 14, y); y += 7;
  doc.text(`Requester: ${ticket.createdByName || "Unknown"}`, 14, y); y += 7;
  doc.text(`Assigned Agent: ${ticket.assignedAgentName || "Unassigned"}`, 14, y); y += 7;
  doc.text(`Created: ${new Date(ticket.createdAt).toLocaleString()}`, 14, y); y += 10;

  doc.setFontSize(12);
  doc.text("Description:", 14, y); y += 7;
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(ticket.description || "", 180);
  doc.text(descLines, 14, y);
  y += descLines.length * 5 + 8;

  if (ticket.aiSummary) {
    doc.setFontSize(12);
    doc.text("AI Analysis:", 14, y); y += 7;
    doc.setFontSize(10);
    const aiLines = doc.splitTextToSize(ticket.aiSummary, 180);
    doc.text(aiLines, 14, y);
    y += aiLines.length * 5 + 8;
  }

  doc.setFontSize(12);
  doc.text("Activity & Discussion:", 14, y); y += 7;
  doc.setFontSize(10);

  if (!comments || comments.length === 0) {
    doc.text("No comments.", 14, y);
    y += 7;
  } else {
    comments.forEach((c) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont(undefined, "bold");
      doc.text(`${c.authorName} — ${new Date(c.createdAt).toLocaleString()}`, 14, y);
      y += 5;
      doc.setFont(undefined, "normal");
      const lines = doc.splitTextToSize(c.content, 180);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 5;
    });
  }

  doc.save(`ticket-${ticket.id}-summary.pdf`);
}