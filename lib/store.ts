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
}

export function getBook(id: string) {
  return loadBooks().find((b) => b.id === id) || null;
}
