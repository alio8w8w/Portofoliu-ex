import { AUTH_SECRET, SESSION_MAX_AGE_SECONDS } from "./config"

// Session token = "<expiresAtMs>.<hex HMAC-SHA256 of expiresAtMs>". Uses Web Crypto, so it
// works both in the proxy and in server components / actions.

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function createSessionToken() {
  const expiresAt = String(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)
  return `${expiresAt}.${await sign(expiresAt)}`
}

export async function isValidSessionToken(token: string | undefined | null) {
  if (!token) return false
  const [expiresAt, signature] = token.split(".")
  if (!expiresAt || !signature || !/^\d+$/.test(expiresAt)) return false
  if (Number(expiresAt) < Date.now()) return false
  return safeEqual(signature, await sign(expiresAt))
}
