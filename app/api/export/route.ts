import { NextResponse } from "next/server";
import { markdownToDocxBuffer, markdownToPrintHtml } from "@/lib/export";

export async function POST(req: Request) {
  const { title, manuscript, kind } = await req.json();
  if (!manuscript) return NextResponse.json({ error: "No manuscript" }, { status: 400 });
  if (kind === "pdf") {
    return new NextResponse(markdownToPrintHtml(title || "Ebook", manuscript), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
  const buf = await markdownToDocxBuffer(title || "Ebook", manuscript);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${(title || "ebook").replace(/[^\w]+/g, "-")}.docx"`,
    },
  });
}
