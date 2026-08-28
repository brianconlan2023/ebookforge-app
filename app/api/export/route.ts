import { NextResponse } from "next/server";
import { markdownToDocxBuffer } from "@/lib/export";
import { printBookHtml } from "@/lib/print";
import { THEMES } from "@/lib/themes";
import type { Ebook } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json();
  const title = body.title || "Ebook";
  const manuscript = body.manuscript || "";
  const kind = body.kind || "pdf";

  if (kind === "pdf" && body.book) {
    const book = body.book as Ebook;
    const theme = THEMES.find((t) => t.id === book.design?.themeId) || THEMES[0];
    return new NextResponse(printBookHtml(book, theme), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (kind === "pdf") {
    const { markdownToPrintHtml } = await import("@/lib/export");
    return new NextResponse(markdownToPrintHtml(title, manuscript), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (!manuscript) return NextResponse.json({ error: "No manuscript" }, { status: 400 });
  const buf = await markdownToDocxBuffer(title, manuscript);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${String(title).replace(/[^\w]+/g, "-")}.docx"`,
    },
  });
}
