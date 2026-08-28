"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Ebook } from "@/lib/types";
import { loadBooks, upsertBook } from "@/lib/store";

export default function Dashboard() {
  const [books, setBooks] = useState<Ebook[]>([]);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => setBooks(loadBooks()), []);

  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    f.text().then((t) => {
      const book = JSON.parse(t) as Ebook;
      if (!book.id) book.id = crypto.randomUUID();
      upsertBook(book);
      setBooks(loadBooks());
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl">Projects</h1>
        <div className="flex gap-2">
          <input ref={file} type="file" accept=".json,.ebookforge.json" className="hidden" onChange={onImport} />
          <button className="btn-ghost" onClick={() => file.current?.click()}>Import project</button>
          <Link href="/new" className="btn">New ebook</Link>
        </div>
      </div>
      <ul className="mt-8 space-y-3">
        {books.length === 0 && <p className="text-stone-500">No books yet.</p>}
        {books.map((b) => (
          <li key={b.id} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4">
            <div>
              <p className="font-medium">{b.title || b.input?.topic}</p>
              <p className="text-xs uppercase tracking-wide text-stone-500">{b.status}</p>
            </div>
            <Link href={`/studio/${b.id}`} className="btn-ghost">Open studio</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
