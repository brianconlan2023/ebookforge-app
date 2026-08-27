"use client";

import BookStudio from "@/components/BookStudio";
import { defaultDesign } from "@/lib/types";
import { getBook } from "@/lib/store";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Ebook } from "@/lib/types";

export default function StudioPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Ebook | null>(null);

  useEffect(() => {
    const found = getBook(id);
    if (found) {
      if (!found.design) found.design = defaultDesign(found.title, found.subtitle);
      setBook(found);
    }
  }, [id]);

  if (!book) {
    return (
      <main className="p-10">
        <p>Book not found in this browser.</p>
        <p className="mt-2 text-sm text-stone-500">Open Dashboard and create or generate a book first.</p>
      </main>
    );
  }

  return <BookStudio book={book} />;
}
