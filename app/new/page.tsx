"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Ebook, EbookInput } from "@/lib/types";
import { defaultDesign } from "@/lib/types";
import { upsertBook } from "@/lib/store";

export default function NewBook() {
  const router = useRouter();
  const [form, setForm] = useState<EbookInput>({
    topic: "",
    audience: "General",
    tone: "Educational",
    length: "10k",
    language: "English",
    format: "Both",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const id = crypto.randomUUID();
    const draft: Ebook = {
      id,
      title: form.topic,
      subtitle: "",
      input: form,
      marketResearch: "",
      titles: [],
      outline: [],
      chapters: [],
      frontMatter: "",
      backMatter: "",
      manuscript: "",
      status: "generating",
      createdAt: new Date().toISOString(),
      design: defaultDesign(form.topic, ""),
    };
    upsertBook(draft);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      upsertBook({ ...draft, status: "failed" });
      setBusy(false);
      return setErr(data.error || "Generation failed");
    }
    upsertBook({ ...draft, ...data, status: "completed", design: defaultDesign(data.title || form.topic, data.subtitle || "") });
    router.push(`/studio/${id}`);
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="font-serif text-3xl">New ebook</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div><label>Topic</label><input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required /></div>
        <div><label>Audience</label>
          <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as EbookInput["audience"] })}>
            {["Beginner", "Intermediate", "Advanced", "General"].map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div><label>Tone</label>
          <select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value as EbookInput["tone"] })}>
            {["Inspirational", "Educational", "Business", "Friendly", "Authoritative", "Custom"].map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div><label>Length</label>
          <select value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value as EbookInput["length"] })}>
            <option value="10k">~10k (demo)</option><option value="25k">~25k</option><option value="50k+">50k+</option>
          </select>
        </div>
        <div><label>Language</label><input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} /></div>
        {err && <p className="text-sm text-red-700">{err}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? "Writing manuscript…" : "Generate & open studio"}</button>
      </form>
    </main>
  );
}
