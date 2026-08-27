import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { User } from "./types";

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-change-me");

export async function signUser(user: User) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret());
}

export async function getUser(): Promise<User | null> {
  const token = cookies().get("ef_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as User;
  } catch {
    return null;
  }
}
