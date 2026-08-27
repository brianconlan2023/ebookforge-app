import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";

export function markdownToDocxBuffer(title: string, md: string) {
  const children: Paragraph[] = [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
  ];
  for (const line of md.split("\n")) {
    if (line.startsWith("# ")) {
      children.push(new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1 }));
    } else if (line.startsWith("## ")) {
      children.push(new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2 }));
    } else if (line.trim()) {
      children.push(new Paragraph({ children: [new TextRun({ text: line, size: 22 })] }));
    } else {
      children.push(new Paragraph({ text: "" }));
    }
  }
  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

export function markdownToPrintHtml(title: string, md: string) {
  const body = md
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  body{font-family:Georgia,serif;max-width:720px;margin:48px auto;line-height:1.6;color:#111}
  h1{page-break-before:always;font-size:28px}
  h1:first-child{page-break-before:avoid}
  h2{font-size:20px;margin-top:1.6em}
  @media print { body{margin:0} }
</style></head><body><p>${body}</p>
<script>window.onload=()=>window.print()</script></body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
