import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth/server"
import { db } from "@/lib/db"
import { neonAuthUser } from "@/lib/db/schema"

export async function getOwnerSession() {
  const ownerEmail = process.env.SITE_OWNER_EMAIL?.trim().toLowerCase()
  if (!ownerEmail) return null

  const { data: session } = await auth.getSession()
  const sessionEmail = session?.user?.email?.trim().toLowerCase()
  if (!session?.user || !sessionEmail || sessionEmail !== ownerEmail) return null

  return {
    userId: session.user.id,
    email: session.user.email,
  }
}

export async function requireOwnerId() {
  const owner = await getOwnerSession()
  if (!owner) throw new Error("Unauthorized")
  return owner.userId
}

export async function getSiteOwnerId() {
  const ownerEmail = process.env.SITE_OWNER_EMAIL?.trim().toLowerCase()
  if (!ownerEmail) return null

  const [owner] = await db
    .select({ id: neonAuthUser.id })
    .from(neonAuthUser)
    .where(eq(neonAuthUser.email, ownerEmail))
    .limit(1)

  return owner?.id ?? null
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
