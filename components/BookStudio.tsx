"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { THEMES, type Theme } from "@/lib/themes";
import { defaultDesign, type Design, type Ebook } from "@/lib/types";
import { upsertBook } from "@/lib/store";

type Pane = "front" | "back" | "interior";
type DragKey = "title" | "subtitle" | "author";

function themeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

function CoverFace({
  side, theme, design, setDesign,
}: {
  side: "front" | "back";
  theme: Theme;
  design: Design;
  setDesign: (d: Design) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ key: DragKey; ox: number; oy: number } | null>(null);
  const c = design.cover;

  function pos(key: DragKey) {
    if (key === "title") return { x: c.titleX, y: c.titleY };
    if (key === "subtitle") return { x: c.subtitleX, y: c.subtitleY };
    return { x: c.authorX, y: c.authorY };
  }

  function setPos(key: DragKey, x: number, y: number) {
    const next = { ...design, cover: { ...c } };
    if (key === "title") { next.cover.titleX = x; next.cover.titleY = y; }
    else if (key === "subtitle") { next.cover.subtitleX = x; next.cover.subtitleY = y; }
    else { next.cover.authorX = x; next.cover.authorY = y; }
    setDesign(next);
  }

  function onPointerDown(key: DragKey, e: React.PointerEvent) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const box = ref.current!.getBoundingClientRect();
    const p = pos(key);
    drag.current = { key, ox: e.clientX - (box.left + (p.x / 100) * box.width), oy: e.clientY - (box.top + (p.y / 100) * box.height) };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !ref.current) return;
    const box = ref.current.getBoundingClientRect();
    const x = Math.min(92, Math.max(8, ((e.clientX - drag.current.ox - box.left) / box.width) * 100));
    const y = Math.min(94, Math.max(8, ((e.clientY - drag.current.oy - box.top) / box.height) * 100));
    setPos(drag.current.key, x, y);
  }

  const border =
    !design.showBorder || theme.border === "none" ? "none"
    : theme.border === "thin" ? `1px solid ${theme.accent}`
    : theme.border === "gold" ? `2px solid ${theme.accent}`
    : theme.border === "frame" ? `8px double ${theme.accent}`
    : `1px solid ${theme.accent}`;

  const serif = theme.titleFont === "serif";

  return (
    <div ref={ref} onPointerMove={onPointerMove} onPointerUp={() => (drag.current = null)}
      className="relative mx-auto aspect-[5/8] w-full max-w-[280px] select-none shadow-2xl"
      style={{ background: theme.coverBg, color: theme.accent }}>
      <div className="absolute inset-3" style={{ border, pointerEvents: "none" }} />
      {theme.border === "ornate" && design.showBorder && (
        <div className="pointer-events-none absolute inset-5 border border-current opacity-40" />
      )}
      {side === "back" ? (
        <div className="absolute inset-8 flex flex-col justify-between text-left" style={{ color: theme.accent }}>
          <p className="text-[10px] leading-relaxed opacity-90">{c.blurb || "Back-cover blurb. Edit in the inspector."}</p>
          <p className={`text-right text-[10px] uppercase tracking-[0.2em] ${serif ? "font-serif" : ""}`}>{c.author}</p>
        </div>
      ) : (
        (["title", "subtitle", "author"] as DragKey[]).map((key) => {
          const p = pos(key);
          const text = key === "title" ? c.title : key === "subtitle" ? c.subtitle : c.author;
          const cls = key === "title"
            ? `text-2xl font-semibold leading-tight ${serif ? "font-serif" : "font-sans tracking-tight"}`
            : key === "subtitle" ? "max-w-[80%] text-[11px] leading-snug opacity-80"
            : "text-[10px] uppercase tracking-[0.28em]";
          return (
            <button key={key} type="button" onPointerDown={(e) => onPointerDown(key, e)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab px-1 text-center active:cursor-grabbing ${cls}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, color: theme.accent }}>
              {text || key}
            </button>
          );
        })
      )}
    </div>
  );
}

export default function BookStudio({ book: initial }: { book: Ebook }) {
  const [book, setBook] = useState<Ebook>({ ...initial, design: initial.design || defaultDesign(initial.title, initial.subtitle) });
  const design = book.design!;
  const theme = themeById(design.themeId);
  const [pane, setPane] = useState<Pane>("front");
  const [genre, setGenre] = useState("all");
  const [q, setQ] = useState("");
  const [chapter, setChapter] = useState(0);
  const [device, setDevice] = useState<"phone" | "tablet" | "paperwhite">("paperwhite");

  useEffect(() => { upsertBook(book); }, [book]);

  function patchDesign(partial: Partial<Design>) {
    setBook({ ...book, design: { ...design, ...partial } });
  }
  function patchCover(partial: Partial<Design["cover"]>) {
    setBook({ ...book, design: { ...design, cover: { ...design.cover, ...partial } } });
  }

  const filtered = useMemo(
    () => THEMES.filter((t) => (genre === "all" || t.genre === genre) && t.name.toLowerCase().includes(q.toLowerCase())),
    [genre, q],
  );
  const genres = useMemo(() => ["all", ...Array.from(new Set(THEMES.map((t) => t.genre)))], []);
  const body = book.chapters[chapter]?.content || book.manuscript || "No chapter text yet.";
  const first = body.trim().replace(/^#+\s.+\n+/, "");
  const width = device === "phone" ? 280 : device === "tablet" ? 420 : 340;

  async function downloadDocx() {
    const res = await fetch("/api/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: book.title, manuscript: book.manuscript, kind: "docx" }) });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${book.title || "ebook"}.docx`;
    a.click();
  }
  async function printPdf() {
    const res = await fetch("/api/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: book.title, manuscript: book.manuscript, kind: "pdf" }) });
    const html = await res.text();
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  }

  return (
    <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 lg:grid-cols-[220px_1fr_300px]">
      <aside className="border-r border-stone-200 bg-white p-3 text-sm">
        <p className="mb-2 text-[10px] uppercase tracking-wider text-stone-400">Structure</p>
        {(["front", "back", "interior"] as Pane[]).map((p) => (
          <button key={p} className={`mb-1 block w-full rounded px-2 py-1 text-left capitalize ${pane === p ? "bg-stone-100" : ""}`} onClick={() => setPane(p)}>{p === "front" ? "Front cover" : p === "back" ? "Back cover" : "Interior"}</button>
        ))}
        <p className="mb-2 mt-3 text-[10px] uppercase tracking-wider text-stone-400">Chapters</p>
        <div className="max-h-[50vh] space-y-1 overflow-auto">
          {book.chapters.length === 0 && <p className="px-2 text-stone-400">Generate a book first.</p>}
          {book.chapters.map((ch, i) => (
            <button key={i} className={`block w-full truncate rounded px-2 py-1 text-left ${chapter === i && pane === "interior" ? "bg-stone-100" : ""}`} onClick={() => { setPane("interior"); setChapter(i); }}>
              {i + 1}. {ch.title}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex flex-col items-center gap-4 bg-[#ebe6dc] p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(["front", "back", "interior"] as Pane[]).map((p) => (
            <button key={p} className={`rounded-full px-3 py-1 ${pane === p ? "bg-ink text-white" : "bg-white"}`} onClick={() => setPane(p)}>{p}</button>
          ))}
          {pane === "interior" && (["phone", "tablet", "paperwhite"] as const).map((d) => (
            <button key={d} className={`rounded-full px-3 py-1 ${device === d ? "bg-ink text-white" : "bg-white"}`} onClick={() => setDevice(d)}>{d}</button>
          ))}
        </div>
        {pane !== "interior" ? (
          <CoverFace side={pane} theme={theme} design={design} setDesign={(d) => setBook({ ...book, design: d })} />
        ) : (
          <div className="overflow-hidden rounded-md shadow-xl" style={{ width, minHeight: width * 1.4, background: theme.pageBg, color: theme.ink }}>
            <article className="px-8 py-10" style={{ fontFamily: theme.titleFont === "serif" ? "Georgia, serif" : "system-ui, sans-serif" }}>
              <p className="mb-6 text-center text-[10px] uppercase tracking-[0.25em] text-stone-400">Chapter {chapter + 1}</p>
              <h2 className="mb-6 text-center text-2xl" style={{ color: theme.coverBg }}>{book.chapters[chapter]?.title || book.title}</h2>
              <div className={`text-[13.5px] leading-7 ${design.justify ? "text-justify" : ""} ${design.dropCap ? "first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:leading-none" : ""}`}>
                {first.slice(0, 1400) || "Empty chapter."}
              </div>
            </article>
          </div>
        )}
        <p className="text-[11px] text-stone-500">Drag title, subtitle, and author on the cover. Autosaves in this browser.</p>
      </section>

      <aside className="space-y-4 overflow-auto border-l border-stone-200 bg-white p-4 text-sm">
        <div className="flex gap-2">
          <button className="btn flex-1" onClick={printPdf}>PDF</button>
          <button className="btn-ghost flex-1" onClick={downloadDocx}>Word</button>
        </div>
        <div><label>Title</label><input value={design.cover.title} onChange={(e) => patchCover({ title: e.target.value })} /></div>
        <div><label>Subtitle</label><input value={design.cover.subtitle} onChange={(e) => patchCover({ subtitle: e.target.value })} /></div>
        <div><label>Author</label><input value={design.cover.author} onChange={(e) => patchCover({ author: e.target.value })} /></div>
        <div><label>Back-cover blurb</label><textarea rows={4} value={design.cover.blurb} onChange={(e) => patchCover({ blurb: e.target.value })} /></div>
        <label className="flex items-center gap-2 normal-case tracking-normal"><input type="checkbox" className="w-auto" checked={design.showBorder} onChange={(e) => patchDesign({ showBorder: e.target.checked })} />Cover border / ornament</label>
        <label className="flex items-center gap-2 normal-case tracking-normal"><input type="checkbox" className="w-auto" checked={design.dropCap} onChange={(e) => patchDesign({ dropCap: e.target.checked })} />Chapter drop cap</label>
        <label className="flex items-center gap-2 normal-case tracking-normal"><input type="checkbox" className="w-auto" checked={design.justify} onChange={(e) => patchDesign({ justify: e.target.checked })} />Justify interior</label>
        <div><label>Theme search</label><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 100+ themes" /></div>
        <div><label>Genre</label>
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            {genres.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((t) => (
            <button key={t.id} onClick={() => patchDesign({ themeId: t.id })} className={`rounded-lg border p-2 text-left ${design.themeId === t.id ? "border-ink ring-1 ring-ink" : "border-stone-200"}`}>
              <span className="mb-1 flex h-10 w-full rounded" style={{ background: `linear-gradient(135deg, ${t.coverBg}, ${t.accent})` }} />
              <span className="block truncate text-[11px] font-medium">{t.name}</span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
