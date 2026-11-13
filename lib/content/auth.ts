import { cookies } from "next/headers"
import { ADMIN_EMAIL, OWNER_ID, SESSION_COOKIE } from "@/lib/auth/config"
import { isValidSessionToken } from "@/lib/auth/session"

export async function getOwnerSession() {
  const cookieStore = await cookies()
  if (!(await isValidSessionToken(cookieStore.get(SESSION_COOKIE)?.value))) return null
  return { userId: OWNER_ID, email: ADMIN_EMAIL }
}

export async function requireOwnerId() {
  const owner = await getOwnerSession()
  if (!owner) throw new Error("Unauthorized")
  return owner.userId
}

export async function getSiteOwnerId() {
  return OWNER_ID
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin")
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
    ?? request.headers.get("host")

  if (!origin || !host) return false

  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase()
  } catch {
    return false
  }
}
