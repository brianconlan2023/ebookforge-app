import type { Ebook } from "./types";
import type { Theme } from "./themes";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function md(s: string) {
  return esc(s)
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
}

export function estimatePages(book: Ebook) {
  const words = (book.manuscript || book.chapters.map((c) => c.content).join(" ")).split(/\s+/).filter(Boolean).length;
  return Math.max(24, Math.round(words / 280));
}

export function spineInches(pages: number) {
  return Math.max(0.06, +(pages * 0.0025).toFixed(3));
}

export function printBookHtml(book: Ebook, theme: Theme) {
  const d = book.design;
  const title = book.design?.cover.title || book.title || "Untitled";
  const author = book.design?.cover.author || "Author";
  const chapters = book.chapters.length
    ? book.chapters
    : [{ title: "Manuscript", content: book.manuscript || "", order: 0 }];

  const toc = chapters.map((c, i) => `<li><a href="#ch-${i}">${esc(c.title)}</a></li>`).join("");

  const body = chapters.map((c, i) => {
    const raw = c.content.replace(/^#+\s.+\n+/, "");
    const ornament = d?.chapterOrnament ? `<div class="orn">❧</div>` : "";
    return `<section class="sheet chapter" id="ch-${i}">
        ${d?.runningHeads ? `<div class="head">${esc(title)} <span>·</span> ${esc(author)}</div>` : ""}
        <div class="opener">
          <p class="kicker">Chapter ${i + 1}</p>
          <h1>${esc(c.title)}</h1>
          ${ornament}
        </div>
        <div class="prose ${d?.dropCap ? "drop" : ""} ${d?.justify ? "just" : ""}"><p>${md(raw)}</p></div>
        <div class="folio"></div>
      </section>`;
  }).join("");

  const trim = d?.trim || "6x9";
  const size = trim === "5x8" ? "5in 8in" : trim === "8.5x11" ? "8.5in 11in" : "6in 9in";

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  @page { size: ${size}; margin: 0.7in 0.65in 0.75in; }
  html,body { margin:0; background:#fff; color:${theme.ink}; font-family:${theme.titleFont === "serif" ? "Georgia, serif" : "system-ui,sans-serif"}; }
  a { color: inherit; text-decoration: none; }
  .sheet { position: relative; page-break-after: always; min-height: 8in; }
  .head { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; text-align: center; color: ${theme.muted}; border-bottom: 1px solid ${theme.muted}33; padding-bottom: 8px; margin-bottom: 28px; }
  .folio::after { content: counter(page); }
  .folio { text-align: center; font-size: 11px; color: ${theme.muted}; margin-top: 36px; }
  .toc { padding-top: 1.2in; }
  .toc h1 { text-align: center; font-weight: 500; }
  .toc ol { list-style: none; padding: 0; max-width: 22em; margin: 2em auto; }
  .toc li { padding: .45em 0; border-bottom: 1px dotted ${theme.muted}; }
  .opener { text-align: center; padding: 18vh 0 8vh; }
  .kicker { letter-spacing: .28em; text-transform: uppercase; font-size: 11px; color: ${theme.muted}; }
  .opener h1 { font-size: 32px; font-weight: 500; margin: .4em 0; color: ${theme.coverBg}; }
  .orn { color: ${theme.accent}; letter-spacing: .4em; margin-top: 12px; }
  .prose { font-size: 12.5pt; line-height: 1.7; }
  .prose.just { text-align: justify; hyphens: auto; }
  .prose.drop p:first-of-type::first-letter { float: left; font-size: 3.2em; line-height: .8; padding-right: 8px; font-family: Georgia, serif; }
</style></head><body>
<section class="sheet toc"><h1>Contents</h1><ol>${toc}</ol></section>
${body}
<script>window.onload=()=>window.print()</script>
</body></html>`;
