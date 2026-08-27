import { NextResponse } from "next/server";
import { signUser } from "@/lib/auth";

const users = globalThis as unknown as { __ef_users?: Map<string, { password: string; name: string; id: string }> };
users.__ef_users ||= new Map();

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const row = users.__ef_users!.get(email);
  if (!row || row.password !== password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = await signUser({ id: row.id, email, name: row.name, plan: "FREE" });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ef_token", token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
