"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { THEMES, type Theme } from "@/lib/themes";
import { defaultDesign, TRIM_IN, type Design, type Ebook } from "@/lib/types";
import { downloadProject, upsertBook } from "@/lib/store";
import { drawCover, downloadPng, KDP } from "@/lib/cover";
import { estimatePages, spineInches } from "@/lib/print";

type Pane = "front" | "back" | "wrap" | "toc" | "interior";
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
  const border = !design.showBorder || theme.border === "none" ? "none" : theme.border === "thin" ? `1px solid ${theme.accent}` : theme.border === "gold" ? `2px solid ${theme.accent}` : theme.border === "frame" ? `8px double ${theme.accent}` : `1px solid ${theme.accent}`;
  const serif = theme.titleFont === "serif";
  return (
    <div ref={ref} onPointerMove={onPointerMove} onPointerUp={() => (drag.current = null)} className="relative mx-auto aspect-[5/8] w-full max-w-[280px] select-none shadow-2xl" style={{ background: theme.coverBg, color: theme.accent }}>
      <div className="absolute inset-3" style={{ border, pointerEvents: "none" }} />
      {theme.border === "ornate" && design.showBorder && <div className="pointer-events-none absolute inset-5 border border-current opacity-40" />}
      {side === "back" ? (
        <div className="absolute inset-8 flex flex-col justify-between text-left" style={{ color: theme.accent }}>
          <p className="text-[10px] leading-relaxed opacity-90">{c.blurb || "Back-cover blurb. Edit in the inspector."}</p>
          <p className={`text-right text-[10px] uppercase tracking-[0.2em] ${serif ? "font-serif" : ""}`}>{c.author}</p>
        </div>
      ) : (["title", "subtitle", "author"] as DragKey[]).map((key) => {
        const p = pos(key);
        const text = key === "title" ? c.title : key === "subtitle" ? c.subtitle : c.author;
        const cls = key === "title" ? `text-2xl font-semibold leading-tight ${serif ? "font-serif" : "font-sans tracking-tight"}` : key === "subtitle" ? "max-w-[80%] text-[11px] leading-snug opacity-80" : "text-[10px] uppercase tracking-[0.28em]";
        return (
          <button key={key} type="button" onPointerDown={(e) => onPointerDown(key, e)} className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab px-1 text-center active:cursor-grabbing ${cls}`} style={{ left: `${p.x}%`, top: `${p.y}%`, color: theme.accent }}>{text || key}</button>
        );
      })}
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
  const fullRef = useRef<HTMLCanvasElement>(null);
  const thumbRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { upsertBook(book); }, [book]);
  useEffect(() => {
    if (!fullRef.current || !thumbRef.current) return;
    drawCover(fullRef.current, theme, design, "front");
    const t = thumbRef.current;
    t.width = 100; t.height = 160;
    const ctx = t.getContext("2d");
    if (ctx) ctx.drawImage(fullRef.current, 0, 0, 100, 160);
  }, [theme, design]);

  function patchDesign(partial: Partial<Design>) { setBook({ ...book, design: { ...design, ...partial } }); }
  function patchCover(partial: Partial<Design["cover"]>) { setBook({ ...book, design: { ...design, cover: { ...design.cover, ...partial } } }); }

  const filtered = useMemo(() => THEMES.filter((t) => (genre === "all" || t.genre === genre) && t.name.toLowerCase().includes(q.toLowerCase())), [genre, q]);
  const genres = useMemo(() => ["all", ...Array.from(new Set(THEMES.map((t) => t.genre)))], []);
  const first = (book.chapters[chapter]?.content || book.manuscript || "").trim().replace(/^#+\s.+\n+/, "");
  const width = device === "phone" ? 280 : device === "tablet" ? 420 : 340;
  const pages = estimatePages(book);
  const spine = spineInches(pages);
  const trim = TRIM_IN[design.trim] || TRIM_IN["6x9"];

  async function printPdf() {
    const res = await fetch("/api/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "pdf", book }) });
    const html = await res.text();
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  }
  async function downloadDocx() {
    const res = await fetch("/api/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: book.title, manuscript: book.manuscript, kind: "docx" }) });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${book.title || "ebook"}.docx`;
    a.click();
  }

  return (
    <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 lg:grid-cols-[220px_1fr_300px]">
      <aside className="border-r border-stone-200 bg-white p-3 text-sm">
        <p className="mb-2 text-[10px] uppercase tracking-wider text-stone-400">Structure</p>
        {(["front", "back", "wrap", "toc", "interior"] as Pane[]).map((p) => (
          <button key={p} className={`mb-1 block w-full rounded px-2 py-1 text-left ${pane === p ? "bg-stone-100" : ""}`} onClick={() => setPane(p)}>
            {p === "front" ? "Front cover" : p === "back" ? "Back cover" : p === "wrap" ? "Paperback wrap" : p === "toc" ? "Table of contents" : "Interior"}
          </button>
        ))}
        <p className="mb-2 mt-3 text-[10px] uppercase tracking-wider text-stone-400">Chapters</p>
        <div className="max-h-[40vh] space-y-1 overflow-auto">
          {book.chapters.map((ch, i) => (
            <button key={i} className={`block w-full truncate rounded px-2 py-1 text-left ${chapter === i && pane === "interior" ? "bg-stone-100" : ""}`} onClick={() => { setPane("interior"); setChapter(i); }}>{i + 1}. {ch.title}</button>
          ))}
        </div>
      </aside>
      <section className="flex flex-col items-center gap-4 bg-[#ebe6dc] p-6">
        {(pane === "front" || pane === "back") && <CoverFace side={pane} theme={theme} design={design} setDesign={(d) => setBook({ ...book, design: d })} />}
        {pane === "wrap" && (
          <div className="flex items-stretch shadow-2xl" style={{ height: 360 }}>
            <div className="flex w-[140px] flex-col justify-between p-3 text-[9px]" style={{ background: theme.coverBg, color: theme.accent }}>
              <p className="leading-relaxed opacity-80">{design.cover.blurb.slice(0, 220) || "Back"}</p>
              <p className="uppercase tracking-widest">{design.cover.author}</p>
            </div>
            <div className="flex items-center justify-center" style={{ background: theme.coverBg, color: theme.accent, width: Math.max(18, spine * 40) }}>
              <span className="origin-center -rotate-90 whitespace-nowrap text-[10px] tracking-widest">{design.cover.title}</span>
            </div>
            <div className="flex w-[140px] flex-col items-center justify-center p-3 text-center" style={{ background: theme.coverBg, color: theme.accent }}>
              <p className="font-serif text-sm font-semibold">{design.cover.title}</p>
              <p className="mt-2 text-[9px] opacity-80">{design.cover.subtitle}</p>
              <p className="mt-6 text-[9px] uppercase tracking-widest">{design.cover.author}</p>
            </div>
          </div>
        )}
        {pane === "toc" && (
          <div className="w-full max-w-md p-10 shadow-xl" style={{ background: theme.pageBg, color: theme.ink }}>
            <h2 className="mb-6 text-center font-serif text-3xl">Contents</h2>
            <ol className="space-y-2 text-sm">
              {book.chapters.map((ch, i) => (
                <li key={i}><button className="flex w-full justify-between border-b border-dotted border-stone-300 py-1 text-left" onClick={() => { setPane("interior"); setChapter(i); }}><span>{ch.title}</span><span className="text-stone-400">{i + 1}</span></button></li>
              ))}
            </ol>
          </div>
        )}
        {pane === "interior" && (
          <>
            <div className="flex gap-2 text-xs">
              {(["phone", "tablet", "paperwhite"] as const).map((d) => (
                <button key={d} className={`rounded-full px-3 py-1 ${device === d ? "bg-ink text-white" : "bg-white"}`} onClick={() => setDevice(d)}>{d}</button>
              ))}
            </div>
            <div className="overflow-hidden rounded-md shadow-xl" style={{ width, minHeight: width * 1.4, background: theme.pageBg, color: theme.ink }}>
              <article className="px-8 py-10" style={{ fontFamily: theme.titleFont === "serif" ? "Georgia, serif" : "system-ui, sans-serif" }}>
                {design.runningHeads && <p className="mb-6 border-b border-stone-200 pb-2 text-center text-[10px] uppercase tracking-[0.2em] text-stone-400">{design.cover.title} · {design.cover.author}</p>}
                <p className="mb-2 text-center text-[10px] uppercase tracking-[0.25em] text-stone-400">Chapter {chapter + 1}</p>
                <h2 className="mb-2 text-center text-2xl" style={{ color: theme.coverBg }}>{book.chapters[chapter]?.title || book.title}</h2>
                {design.chapterOrnament && <p className="mb-6 text-center text-gold">❧</p>}
                <div className={`text-[13.5px] leading-7 ${design.justify ? "text-justify" : ""} ${design.dropCap ? "first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:leading-none" : ""}`}>{first.slice(0, 1400) || "Empty chapter."}</div>
              </article>
            </div>
          </>
        )}
        <div className="flex items-end gap-4">
          <div className="text-center">
            <canvas ref={thumbRef} width={100} height={160} className="border border-stone-300 bg-white shadow-sm" />
            <p className="mt-1 text-[10px] text-stone-500">Amazon thumb · 100px</p>
          </div>
          <p className="max-w-xs text-[11px] text-stone-500">Title must read at thumbnail size. KDP master is {KDP.w}×{KDP.h}. Trim {trim.w}×{trim.h}in · ~{pages} pages · spine {spine}"</p>
        </div>
        <canvas ref={fullRef} className="hidden" />
      </section>
      <aside className="space-y-4 overflow-auto border-l border-stone-200 bg-white p-4 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <button className="btn" onClick={printPdf}>Print PDF</button>
          <button className="btn-ghost" onClick={downloadDocx}>Word</button>
          <button className="btn-ghost" onClick={() => fullRef.current && downloadPng(fullRef.current, `${design.cover.title || "cover"}-kdp-1600x2560.png`)}>KDP cover</button>
          <button className="btn-ghost" onClick={() => downloadProject(book)}>Save project</button>
        </div>
        <div><label>Title</label><input value={design.cover.title} onChange={(e) => patchCover({ title: e.target.value })} /></div>
        <div><label>Subtitle</label><input value={design.cover.subtitle} onChange={(e) => patchCover({ subtitle: e.target.value })} /></div>
        <div><label>Author</label><input value={design.cover.author} onChange={(e) => patchCover({ author: e.target.value })} /></div>
        <div><label>Back-cover blurb</label><textarea rows={4} value={design.cover.blurb} onChange={(e) => patchCover({ blurb: e.target.value })} /></div>
        <div><label>Trim</label>
          <select value={design.trim} onChange={(e) => patchDesign({ trim: e.target.value as Design["trim"] })}>
            <option value="5x8">5 × 8</option><option value="6x9">6 × 9</option><option value="8.5x11">8.5 × 11</option>
          </select>
        </div>
        {([["showBorder", "Cover border"],["dropCap", "Drop cap"],["justify", "Justify interior"],["chapterOrnament", "Chapter ornament"],["runningHeads", "Running heads"]] as const).map(([k, label]) => (
          <label key={k} className="flex items-center gap-2 normal-case tracking-normal">
            <input type="checkbox" className="w-auto" checked={Boolean(design[k])} onChange={(e) => patchDesign({ [k]: e.target.checked } as Partial<Design>)} />{label}
          </label>
        ))}
        <div><label>Theme search</label><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 100+ themes" /></div>
        <div><label>Genre</label><select value={genre} onChange={(e) => setGenre(e.target.value)}>{genres.map((g) => <option key={g} value={g}>{g}</option>)}</select></div>
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
