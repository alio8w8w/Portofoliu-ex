import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { getOwnerSession, isSameOriginRequest } from "@/lib/content/auth"

export const runtime = "nodejs"

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]
const videoTypes = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"]

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 })
  }

  const owner = await getOwnerSession()
  if (!owner) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  let body: HandleUploadBody
  try {
    body = await request.json() as HandleUploadBody
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 })
  }

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!pathname.startsWith("portfolio/") || pathname.includes("..")) {
          throw new Error("Invalid file path")
        }

        let payload: { kind?: unknown; contentType?: unknown }
        try {
          payload = JSON.parse(clientPayload ?? "{}") as { kind?: unknown; contentType?: unknown }
        } catch {
          throw new Error("Invalid file details")
        }

        const kind = payload.kind
        const contentType = payload.contentType
        const allowedContentTypes = kind === "image" ? imageTypes : kind === "video" ? videoTypes : []

        if (typeof contentType !== "string" || !allowedContentTypes.includes(contentType)) {
          throw new Error("Unsupported file type")
        }

        return {
          allowedContentTypes,
          maximumSizeInBytes: kind === "video" ? 500 * 1024 * 1024 : 20 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: owner.userId }),
        }
      },
    })

    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ error: "Upload could not be authorized." }, { status: 400 })
  }
}
