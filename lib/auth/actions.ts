"use server"

import { cookies } from "next/headers"
import { ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "./config"
import { createSessionToken, safeEqual } from "./session"

export async function signIn(email: string, password: string): Promise<{ error?: string }> {
  const emailOk = safeEqual(String(email).trim().toLowerCase(), ADMIN_EMAIL)
  const passwordOk = safeEqual(String(password), ADMIN_PASSWORD)
  if (!emailOk || !passwordOk) return { error: "invalid" }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
  return {}
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
