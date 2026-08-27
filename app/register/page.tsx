"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
    if (!res.ok) return setErr((await res.json()).error || "Failed");
    router.push("/dashboard");
  }
  return (
    <main className="mx-auto max-w-sm px-4 py-20">
      <h1 className="font-serif text-3xl">Create account</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div><label>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></div>
        <div><label>Password</label><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required /></div>
        {err && <p className="text-sm text-red-700">{err}</p>}
        <button className="btn w-full">Start</button>
      </form>
    </main>
  );
}
