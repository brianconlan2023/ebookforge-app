import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "EbookForge",
  description: "AI publishing engine — topic in, finished ebook out.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-stone-200 bg-paper/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-serif text-xl tracking-tight">EbookForge</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/pricing">Pricing</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/new">New book</Link>
              <Link href="/login">Sign in</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
