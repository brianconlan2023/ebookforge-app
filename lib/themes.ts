export type Theme = {
  id: string;
  name: string;
  genre: string;
  coverBg: string;
  accent: string;
  pageBg: string;
  muted: string;
  titleFont: "serif" | "sans";
  border: "none" | "thin" | "ornate" | "gold" | "frame";
  ink: string;
};

const VARIANTS: [string, Theme["titleFont"], Theme["border"]][] = [
  ["Classic", "serif", "ornate"],
  ["Modern", "sans", "none"],
  ["Luxe", "serif", "gold"],
  ["Minimal", "sans", "thin"],
  ["Editorial", "serif", "frame"],
];

const PALETTES: Record<string, [string, string, string, string][]> = {
  romance: [["#3b1f2b","#f4c6d3","#fff7f4","#c45c7a"],["#1a0f14","#e8b4b8","#fdecef","#8b3a4a"],["#4a2c40","#f7d6c8","#fff8f3","#d4a0a0"],["#2c1810","#e8c4a8","#faf3eb","#b86b4a"],["#3d2a32","#f3c1c6","#fff5f6","#a85a6a"]],
  thriller: [["#0b0b0d","#e11d2e","#f4f4f5","#9ca3af"],["#111827","#f59e0b","#f8fafc","#64748b"],["#0f172a","#22d3ee","#e2e8f0","#94a3b8"],["#1c1917","#ef4444","#fafafa","#a8a29e"],["#020617","#f97316","#f1f5f9","#64748b"]],
  mystery: [["#1e1b4b","#c4b5fd","#f5f3ff","#a78bfa"],["#1c1917","#d6d3d1","#fafaf9","#78716c"],["#312e81","#fde68a","#fffbeb","#a16207"],["#0f172a","#93c5fd","#eff6ff","#64748b"],["#292524","#fcd34d","#fffbeb","#92400e"]],
  fantasy: [["#1a1025","#d4af37","#f8f1de","#8b6914"],["#0c1220","#7dd3fc","#e0f2fe","#0369a1"],["#2a1810","#c2410c","#fff7ed","#9a3412"],["#14532d","#86efac","#f0fdf4","#166534"],["#3b0764","#e9d5ff","#faf5ff","#7e22ce"]],
  scifi: [["#020617","#22d3ee","#ecfeff","#67e8f9"],["#0b1020","#a78bfa","#f5f3ff","#c4b5fd"],["#111827","#34d399","#ecfdf5","#6ee7b7"],["#082f49","#38bdf8","#f0f9ff","#7dd3fc"],["#18181b","#fb7185","#fff1f2","#fda4af"]],
  literary: [["#1c1917","#e7e5e4","#fafaf9","#a8a29e"],["#292524","#d6d3d1","#f5f5f4","#78716c"],["#44403c","#f5f5f4","#ffffff","#a8a29e"],["#0c0a09","#eab308","#fffbeb","#a16207"],["#3f3f46","#fafafa","#ffffff","#d4d4d8"]],
  business: [["#0f172a","#f8fafc","#ffffff","#94a3b8"],["#111827","#38bdf8","#f0f9ff","#0ea5e9"],["#1e293b","#fbbf24","#fffbeb","#d97706"],["#0a0a0a","#ffffff","#fafafa","#737373"],["#1d4ed8","#eff6ff","#ffffff","#93c5fd"]],
  selfhelp: [["#0f766e","#ccfbf1","#f0fdfa","#14b8a6"],["#7c2d12","#fed7aa","#fff7ed","#ea580c"],["#1e3a5f","#bfdbfe","#eff6ff","#3b82f6"],["#365314","#d9f99d","#f7fee7","#65a30d"],["#4c1d95","#ddd6fe","#f5f3ff","#8b5cf6"]],
  memoir: [["#44403c","#f5f5f4","#fafaf9","#a8a29e"],["#7f1d1d","#fecaca","#fef2f2","#ef4444"],["#1e3a8a","#bfdbfe","#eff6ff","#60a5fa"],["#3f3f46","#e4e4e7","#fafafa","#a1a1aa"],["#57534e","#e7e5e4","#fafaf9","#d6d3d1"]],
  history: [["#3f2e1f","#e8d5b7","#faf6ef","#b08968"],["#1c1917","#d6d3d1","#fafaf9","#a8a29e"],["#4a3728","#c4a574","#f8f1e3","#8b6914"],["#2c1810","#f5e6c8","#fffbeb","#92400e"],["#292524","#e7e5e4","#fafaf9","#78716c"]],
  spiritual: [["#312e81","#c4b5fd","#f5f3ff","#8b5cf6"],["#134e4a","#99f6e4","#f0fdfa","#14b8a6"],["#431407","#fdba74","#fff7ed","#ea580c"],["#1e1b4b","#e9d5ff","#faf5ff","#a78bfa"],["#365314","#bef264","#f7fee7","#84cc16"]],
  horror: [["#0a0a0a","#7f1d1d","#fafafa","#ef4444"],["#1c1917","#991b1b","#fef2f2","#b91c1c"],["#111111","#fafafa","#ffffff","#737373"],["#1a0a0a","#dc2626","#fff1f2","#991b1b"],["#0c0a09","#a16207","#fffbeb","#854d0e"]],
  ya: [["#831843","#f9a8d4","#fdf2f8","#ec4899"],["#1e3a8a","#93c5fd","#eff6ff","#3b82f6"],["#9a3412","#fdba74","#fff7ed","#f97316"],["#6b21a8","#d8b4fe","#faf5ff","#a855f7"],["#0f766e","#5eead4","#f0fdfa","#14b8a6"]],
  poetry: [["#1c1917","#e7e5e4","#fafaf9","#a8a29e"],["#4c1d95","#e9d5ff","#faf5ff","#c4b5fd"],["#44403c","#fef3c7","#fffbeb","#d97706"],["#0f172a","#e2e8f0","#f8fafc","#94a3b8"],["#3f3f46","#fbcfe8","#fdf2f8","#db2777"]],
  cookbook: [["#7c2d12","#fed7aa","#fff7ed","#ea580c"],["#365314","#d9f99d","#f7fee7","#65a30d"],["#9f1239","#fecdd3","#fff1f2","#e11d48"],["#1e3a5f","#bfdbfe","#eff6ff","#2563eb"],["#44403c","#f5f5f4","#fafaf9","#a8a29e"]],
  academic: [["#1e3a8a","#dbeafe","#eff6ff","#3b82f6"],["#111827","#e5e7eb","#f9fafb","#6b7280"],["#1e293b","#f8fafc","#ffffff","#64748b"],["#0f172a","#cbd5e1","#f1f5f9","#475569"],["#1e40af","#93c5fd","#eff6ff","#60a5fa"]],
  children: [["#0369a1","#7dd3fc","#f0f9ff","#0ea5e9"],["#be185d","#f9a8d4","#fdf2f8","#ec4899"],["#ca8a04","#fde047","#fefce8","#eab308"],["#15803d","#86efac","#f0fdf4","#22c55e"],["#7c3aed","#c4b5fd","#f5f3ff","#8b5cf6"]],
  western: [["#7c2d12","#fdba74","#fff7ed","#c2410c"],["#44403c","#d6d3d1","#fafaf9","#a8a29e"],["#78350f","#fbbf24","#fffbeb","#d97706"],["#292524","#e7e5e4","#fafaf9","#78716c"],["#431407","#fed7aa","#fff7ed","#9a3412"]],
  crime: [["#0b0b0d","#e5e5e5","#fafafa","#737373"],["#111827","#f87171","#fef2f2","#dc2626"],["#18181b","#facc15","#fefce8","#ca8a04"],["#1c1917","#a8a29e","#fafaf9","#78716c"],["#020617","#60a5fa","#eff6ff","#2563eb"]],
  wellness: [["#134e4a","#99f6e4","#f0fdfa","#14b8a6"],["#3f6212","#d9f99d","#f7fee7","#84cc16"],["#9a3412","#fed7aa","#fff7ed","#fb923c"],["#1e3a5f","#bae6fd","#f0f9ff","#38bdf8"],["#4a044e","#f5d0fe","#fdf4ff","#d946ef"]],
};

const LABELS: Record<string, string> = {
  romance: "Romance", thriller: "Thriller", mystery: "Mystery", fantasy: "Fantasy",
  scifi: "Science Fiction", literary: "Literary", business: "Business", selfhelp: "Self-Help",
  memoir: "Memoir", history: "History", spiritual: "Spiritual", horror: "Horror",
  ya: "Young Adult", poetry: "Poetry", cookbook: "Lifestyle", academic: "Academic",
  children: "Children", western: "Western", crime: "Crime", wellness: "Wellness",
};

function build(): Theme[] {
  const out: Theme[] = [
    { id: "kc-modern", name: "Kindle Modern", genre: "literary", coverBg: "#111827", accent: "#111827", pageBg: "#fafafa", muted: "#6b7280", titleFont: "sans", border: "none", ink: "#111111" },
    { id: "kc-classic", name: "Kindle Classic", genre: "literary", coverBg: "#1c1917", accent: "#1c1917", pageBg: "#faf6ef", muted: "#78716c", titleFont: "serif", border: "ornate", ink: "#111111" },
    { id: "kc-cosmos", name: "Kindle Cosmos", genre: "scifi", coverBg: "#0f172a", accent: "#38bdf8", pageBg: "#f8fafc", muted: "#64748b", titleFont: "sans", border: "none", ink: "#111111" },
    { id: "kc-amour", name: "Kindle Amour", genre: "romance", coverBg: "#4a2c40", accent: "#c45c7a", pageBg: "#fff8f3", muted: "#a85a6a", titleFont: "serif", border: "gold", ink: "#111111" },
  ];
  for (const [g, pals] of Object.entries(PALETTES)) {
    VARIANTS.forEach(([v, font, border], i) => {
      const [coverBg, accent, pageBg, muted] = pals[i];
      out.push({ id: `${g}-${v.toLowerCase()}`, name: `${LABELS[g]} ${v}`, genre: g, coverBg, accent, pageBg, muted, titleFont: font, border, ink: "#111111" });
    });
  }
  return out;
}

export const THEMES = build();
export const GENRES = [...new Set(THEMES.map((t) => t.genre))];
