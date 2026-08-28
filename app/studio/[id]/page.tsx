"use client";

import BookStudio from "@/components/BookStudio";
import { defaultDesign, type Ebook } from "@/lib/types";
import { getBook } from "@/lib/store";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudioPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Ebook | null>(null);

  useEffect(() => {
    const found = getBook(id);
    if (found) {
      found.design = { ...defaultDesign(found.title, found.subtitle), ...found.design };
      setBook(found);
    }
  }, [id]);

  if (!book) {
    return (
      <main className="p-10">
        <p>Book not found in this browser.</p>
        <p className="mt-2 text-sm text-stone-500">Import a .ebookforge.json from Dashboard, or create a book first.</p>
      </main>
    );
  }

  return <BookStudio book={book} />;
}
