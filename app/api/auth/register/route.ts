import { NextResponse } from "next/server";
import { signUser } from "@/lib/auth";

const users = globalThis as unknown as { __ef_users?: Map<string, { password: string; name: string; id: string }> };
users.__ef_users ||= new Map();

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: "Valid email and 6+ char password required" }, { status: 400 });
  }
  if (users.__ef_users!.has(email)) {
    return NextResponse.json({ error: "Account exists — sign in" }, { status: 409 });
  }
  const id = crypto.randomUUID();
  users.__ef_users!.set(email, { password, name: name || email, id });
  const token = await signUser({ id, email, name: name || email, plan: "FREE" });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ef_token", token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
