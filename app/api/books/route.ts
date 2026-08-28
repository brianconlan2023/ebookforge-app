import { NextResponse } from "next/server";
import type { Ebook } from "@/lib/types";

const g = globalThis as unknown as { __ef_books?: Map<string, Ebook> };
g.__ef_books ||= new Map();

export async function GET() {
  return NextResponse.json([...g.__ef_books!.values()]);
}

export async function POST(req: Request) {
  const book = (await req.json()) as Ebook;
  if (!book?.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  g.__ef_books!.set(book.id, book);
  return NextResponse.json({ ok: true });
}
