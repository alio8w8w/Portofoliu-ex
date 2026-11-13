import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE } from "@/lib/auth/config"
import { isValidSessionToken } from "@/lib/auth/session"

export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/sign-in") return NextResponse.next()

  if (!(await isValidSessionToken(request.cookies.get(SESSION_COOKIE)?.value))) {
    return NextResponse.redirect(new URL("/admin/sign-in", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
