import OpenAI from "openai";
import type { Ebook, EbookInput } from "./types";

function client() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

async function ask(system: string, user: string) {
  const openai = client();
  if (!openai) throw new Error("OPENAI_API_KEY missing");
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  const text = res.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty model response");
  return text;
}

function parseJson<T>(raw: string): T {
  const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) throw new Error("Model did not return JSON");
  return JSON.parse(match[0]) as T;
}

const writer = (lang: string, tone: string) =>
  `You are a professional nonfiction ghostwriter. Language: ${lang}. Tone: ${tone}. No placeholders. Complete prose only.`;

export async function runPipeline(input: EbookInput): Promise<Omit<Ebook, "id" | "createdAt" | "status" | "input">> {
  const tone = input.tone === "Custom" ? input.customTone || "Professional" : input.tone;
  const words = input.length === "10k" ? 2500 : input.length === "25k" ? 4000 : 5500;

  const research = await ask(
    writer(input.language, tone),
    `Step 1 Market research for ebook topic "${input.topic}" aimed at ${input.audience}. Cover demand, 4 competitor titles with strengths/weaknesses, keywords, unique angle. 400-600 words.`
  );

  const titlesRaw = await ask(
    writer(input.language, tone) + " Return JSON only.",
    `Step 2 Titles. Topic: ${input.topic}. Research:\n${research}\nReturn JSON: {"titles":[{"title":"","subtitle":""}]} with 5 options.`
  );
  const titles = parseJson<{ titles: { title: string; subtitle: string }[] }>(titlesRaw).titles;
  const chosen = titles[0];

  const outlineRaw = await ask(
    writer(input.language, tone) + " Return JSON only.",
    `Step 3 Outline for "${chosen.title}: ${chosen.subtitle}". Audience ${input.audience}. Target ~${words} words total.\nReturn JSON: {"chapters":[{"title":"","sections":["",""]}]} with 6-8 chapters.`
  );
  const outline = parseJson<{ chapters: { title: string; sections: string[] }[] }>(outlineRaw).chapters;

  const per = Math.max(350, Math.floor(words / outline.length));
  const chapters = [];
  let prev = "";
  for (let i = 0; i < outline.length; i++) {
    const ch = outline[i];
    const content = await ask(
      writer(input.language, tone),
      `Step 4 Write chapter ${i + 1}/${outline.length}: "${ch.title}".\nSections: ${ch.sections.join("; ")}.\nBook: ${chosen.title}. Audience: ${input.audience}.\nPrevious chapter ending: ${prev.slice(-400)}\nWrite ~${per} words of finished chapter prose with headings. No placeholders.`
    );
    chapters.push({ title: ch.title, content, order: i });
    prev = content;
  }

  const manuscript = chapters.map((c) => `# ${c.title}\n\n${c.content}`).join("\n\n");

  const edited = await ask(
    writer(input.language, tone),
    `Step 5 Editing pass. Fix flow, repetition, and headings. Keep all chapters. Return the full edited markdown manuscript.\n\n${manuscript.slice(0, 24000)}`
  );

  const front = await ask(
    writer(input.language, tone),
    `Step 6 Front matter markdown for "${chosen.title}". Include title page, copyright, dedication, about-this-book. Short.`
  );
  const back = await ask(
    writer(input.language, tone),
    `Step 6 Back matter markdown for "${chosen.title}": conclusion call-to-action, about the author (generic), further reading.`
  );

  return {
    title: chosen.title,
    subtitle: chosen.subtitle,
    marketResearch: research,
    titles,
    outline: outline.map((c) => ({ title: c.title, sections: c.sections })),
    chapters,
    frontMatter: front,
    backMatter: back,
    manuscript: `${front}\n\n${edited}\n\n${back}`,
  };
}
