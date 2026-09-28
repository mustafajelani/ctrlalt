import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "cad_admin";
const SESSION_HOURS = 12;

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && (process.env.SESSION_SECRET?.length ?? 0) >= 32);
}

function sign(value: string) {
  return createHmac("sha256", process.env.SESSION_SECRET!).update(value).digest("base64url");
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function passwordMatches(input: string) {
  if (!adminConfigured()) return false;
  return timingSafeEqual(digest(input), digest(process.env.ADMIN_PASSWORD!));
}

export async function createSession() {
  const expires = String(Date.now() + SESSION_HOURS * 3600_000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  // Read cookies before the config check so admin routes always render per request.
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!adminConfigured()) return false;
  const [expires, signature] = raw?.split(".") ?? [];
  if (!expires || !signature) return false;
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(expires));
  return a.length === b.length && timingSafeEqual(a, b) && Number(expires) > Date.now();
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
