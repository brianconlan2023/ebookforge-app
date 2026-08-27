import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 py-24">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold">AI publishing engine</p>
        <h1 className="font-serif text-5xl leading-tight md:text-6xl">Topic in.<br />Finished ebook out.</h1>
        <p className="mt-6 max-w-xl text-lg text-stone-600">
          Market research, titles, outline, chapters, edit pass, then PDF and Word.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/register" className="btn">Start free book</Link>
          <Link href="/pricing" className="btn-ghost">See plans</Link>
        </div>
      </section>
      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-16 md:grid-cols-3">
          {[["Research", "Demand, competitors, keywords, angle."],["Write", "Structured TOC then long-form chapters."],["Ship", "Edit pass + PDF / DOCX download."]].map(([t, d]) => (
            <div key={t}><h2 className="font-serif text-2xl">{t}</h2><p className="mt-2 text-stone-600">{d}</p></div>
          ))}
        </div>
      </section>
    </main>
  );
}
