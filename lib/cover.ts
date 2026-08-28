import type { Design } from "./types";
import type { Theme } from "./themes";

export const KDP = { w: 1600, h: 2560 };

export function drawCover(
  canvas: HTMLCanvasElement,
  theme: Theme,
  design: Design,
  kind: "front" | "back" = "front",
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { w, h } = KDP;
  canvas.width = w;
  canvas.height = h;
  ctx.fillStyle = theme.coverBg;
  ctx.fillRect(0, 0, w, h);

  if (design.showBorder && theme.border !== "none") {
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = theme.border === "gold" ? 10 : theme.border === "frame" ? 16 : 4;
    ctx.strokeRect(48, 48, w - 96, h - 96);
    if (theme.border === "ornate" || theme.border === "frame") {
      ctx.lineWidth = 2;
      ctx.strokeRect(80, 80, w - 160, h - 160);
    }
  }

  ctx.fillStyle = theme.accent;
  ctx.textAlign = "center";
  const c = design.cover;

  if (kind === "back") {
    ctx.font = "36px Georgia, serif";
    wrap(ctx, c.blurb || "Back-cover blurb", w * 0.18, h * 0.18, w * 0.64, 48);
    ctx.font = "28px system-ui, sans-serif";
    ctx.fillText((c.author || "Author").toUpperCase(), w * 0.5, h * 0.88);
    return;
  }

  ctx.font = `${theme.titleFont === "serif" ? "bold 96px Georgia" : "700 92px system-ui"}`;
  wrap(ctx, c.title || "Untitled", w * (c.titleX / 100), h * (c.titleY / 100), w * 0.78, 108);
  ctx.font = "36px system-ui, sans-serif";
  wrap(ctx, c.subtitle || "", w * (c.subtitleX / 100), h * (c.subtitleY / 100), w * 0.7, 44);
  ctx.font = "28px system-ui, sans-serif";
  ctx.fillText((c.author || "Author").toUpperCase(), w * (c.authorX / 100), h * (c.authorY / 100));
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  if (!text) return;
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > max && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  const start = y - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, start + i * lh));
}

export function downloadPng(canvas: HTMLCanvasElement, name: string) {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = name;
  a.click();
}
