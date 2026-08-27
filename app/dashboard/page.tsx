"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Ebook } from "@/lib/types";
import { loadBooks } from "@/lib/store";

export default function Dashboard() {
  const [books, setBooks] = useState<Ebook[]>([]);
  useEffect(() => setBooks(loadBooks()), []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Projects</h1>
        <Link href="/new" className="btn">New ebook</Link>
      </div>
      <ul className="mt-8 space-y-3">
        {books.length === 0 && <p className="text-stone-500">No books yet.</p>}
        {books.map((b) => (
          <li key={b.id} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4">
            <div>
              <p className="font-medium">{b.title || b.input.topic}</p>
              <p className="text-xs uppercase tracking-wide text-stone-500">{b.status}</p>
            </div>
            <Link href={`/studio/${b.id}`} className="btn-ghost">Open studio</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
