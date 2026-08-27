import Link from "next/link";
const plans = [
  { name: "Free", books: "1 book trial", price: "$0" },
  { name: "Starter", books: "5 books / month", price: "$19" },
  { name: "Pro", books: "25 books / month", price: "$49" },
  { name: "Agency", books: "Fair-use unlimited", price: "$149" },
];
export default function Pricing() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-serif text-4xl">Pricing</h1>
      <p className="mt-2 text-stone-600">Plans match the product. Stripe / Razorpay come next.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-4">
        {plans.map((p) => (
          <div key={p.name} className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="font-serif text-2xl">{p.name}</h2>
            <p className="mt-2 text-3xl">{p.price}</p>
            <p className="mt-1 text-sm text-stone-500">{p.books}</p>
            <Link href="/register" className="btn mt-6 w-full">Choose</Link>
          </div>
        ))}
      </div>
    </main>
  );
}
