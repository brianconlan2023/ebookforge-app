import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/ai";
import type { EbookInput } from "@/lib/types";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const input = (await req.json()) as EbookInput;
    if (!input?.topic?.trim()) {
      return NextResponse.json({ error: "Topic required" }, { status: 400 });
    }
    const book = await runPipeline(input);
    return NextResponse.json(book);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
