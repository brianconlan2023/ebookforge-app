import type { Ebook } from "./types";

const KEY = "ef_books";

export function loadBooks(): Ebook[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveBooks(books: Ebook[]) {
  localStorage.setItem(KEY, JSON.stringify(books));
}

export function upsertBook(book: Ebook) {
  const list = loadBooks();
  const i = list.findIndex((b) => b.id === book.id);
  if (i >= 0) list[i] = book;
  else list.unshift(book);
  saveBooks(list);
  if (typeof window !== "undefined") {
    fetch("/api/books", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(book) }).catch(() => {});
  }
}

export function getBook(id: string) {
  return loadBooks().find((b) => b.id === id) || null;
}

export function downloadProject(book: Ebook) {
  const blob = new Blob([JSON.stringify(book, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(book.title || "ebook").replace(/[^\w]+/g, "-")}.ebookforge.json`;
  a.click();
}
