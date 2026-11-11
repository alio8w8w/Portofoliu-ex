import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/server"

const authHandlers = auth.handler()
type AuthRouteContext = { params: Promise<{ path: string[] }> }

export const GET = (request: Request, context: AuthRouteContext) => authHandlers.GET(request, context)
export const PUT = (request: Request, context: AuthRouteContext) => authHandlers.PUT(request, context)
export const PATCH = (request: Request, context: AuthRouteContext) => authHandlers.PATCH(request, context)
export const DELETE = (request: Request, context: AuthRouteContext) => authHandlers.DELETE(request, context)

export async function POST(request: Request, context: AuthRouteContext) {
  if (new URL(request.url).pathname === "/api/auth/sign-up/email") {
    const configuredOwner = process.env.SITE_OWNER_EMAIL?.trim().toLowerCase()
    let requestedEmail = ""

    try {
      const body = await request.clone().json() as { email?: unknown }
      requestedEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    } catch {
      return NextResponse.json({ error: { message: "Account setup is unavailable." } }, { status: 400 })
    }

    if (!configuredOwner || requestedEmail !== configuredOwner) {
      return NextResponse.json({ error: { message: "Account setup is unavailable." } }, { status: 403 })
    }
  }

  return authHandlers.POST(request, context)
}
