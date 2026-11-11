"use server"

import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { portfolioEntries, portfolioMedia, portfolioTasks } from "@/lib/db/schema"
import { requireOwnerId } from "@/lib/content/auth"
import { CONTENT_META, CONTENT_KINDS, type ContentKind, type ContentStatus, type PortfolioMedia, type RichTextDocument } from "@/lib/content/types"

export type ActionResult = { success?: string; error?: string; entryId?: string }

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]
const videoTypes = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"]

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
}

function textValue(formData: FormData, name: string, maximumLength: number) {
  const value = formData.get(name)
  if (typeof value !== "string") return ""
  return value.trim().slice(0, maximumLength)
}

function isValidDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function isContentKind(value: string): value is ContentKind {
  return CONTENT_KINDS.includes(value as ContentKind)
}

function parseDocument(value: string): RichTextDocument | null {
  if (!value || value.length > 200_000) return null

  try {
    const document = JSON.parse(value) as RichTextDocument
    if (!document || document.type !== "doc" || !Array.isArray(document.content)) return null
    return document
  } catch {
    return null
  }
}

function safeVideoUrl(value: string) {
  if (!value) return null

  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase()
    const isBlob = hostname.endsWith(".public.blob.vercel-storage.com")
    const isVideoPlatform = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "vimeo.com", "www.vimeo.com"].includes(hostname)
    return url.protocol === "https:" && (isBlob || isVideoPlatform) ? url.toString() : null
  } catch {
    return null
  }
}

function revalidateContent(kind: ContentKind, slug?: string) {
  const segment = CONTENT_META[kind].segment
  revalidatePath("/admin")
  revalidatePath(`/admin/${segment}`)
  revalidatePath(`/${segment}`)
  if (slug) revalidatePath(`/${segment}/${slug}`)
}

export async function saveContentEntry(formData: FormData): Promise<ActionResult> {
  const userId = await requireOwnerId()
  const rawKind = textValue(formData, "kind", 30)
  if (!isContentKind(rawKind)) return { error: "Categoria invalidă." }

  const kind = rawKind
  const id = textValue(formData, "id", 80)
  const title = textValue(formData, "title", 180)
  const excerpt = textValue(formData, "excerpt", 600)
  const slug = slugify(textValue(formData, "slug", 180) || title)
  const location = textValue(formData, "location", 160) || null
  const coverUrl = textValue(formData, "coverUrl", 2048) || null
  const coverAlt = textValue(formData, "coverAlt", 240)
  const rawVideoUrl = textValue(formData, "videoUrl", 2048)
  const videoUrl = safeVideoUrl(rawVideoUrl)
  const occurredAtValue = textValue(formData, "occurredAt", 10)
  const occurredAt = isValidDateOnly(occurredAtValue) ? occurredAtValue : null
  const status: ContentStatus = formData.get("status") === "published" ? "published" : "draft"
  const featured = formData.get("featured") === "on"
  const document = parseDocument(textValue(formData, "body", 200_000))

  if (!title) return { error: "Adaugă un titlu înainte de salvare." }
  if (!slug) return { error: "Adaugă un titlu sau un link valid." }
  if (!document) return { error: "Textul nu a putut fi salvat. Verifică editorul și încearcă din nou." }
  if (rawVideoUrl && !videoUrl) return { error: "Linkul video trebuie să fie un URL HTTPS de pe Blob, YouTube sau Vimeo." }
  if (occurredAtValue && !occurredAt) return { error: "Data introdusă nu este validă." }
  if (coverUrl && !coverAlt) return { error: "Adaugă o descriere pentru imaginea de copertă." }

  if (coverUrl) {
    const [ownedMedia] = await db
      .select({ id: portfolioMedia.id })
      .from(portfolioMedia)
      .where(and(eq(portfolioMedia.userId, userId), eq(portfolioMedia.url, coverUrl)))
      .limit(1)
    if (!ownedMedia) return { error: "Alege o imagine din biblioteca media a contului tău." }
  }

  const [existing] = id
    ? await db.select({ id: portfolioEntries.id, publishedAt: portfolioEntries.publishedAt })
        .from(portfolioEntries)
        .where(and(eq(portfolioEntries.id, id), eq(portfolioEntries.userId, userId), eq(portfolioEntries.kind, kind)))
        .limit(1)
    : []

  if (id && !existing) return { error: "Elementul nu a fost găsit." }

  const now = new Date()
  const values = {
    userId,
    kind,
    slug,
    title,
    excerpt,
    body: document,
    coverUrl,
    coverAlt: coverUrl ? coverAlt : "",
    videoUrl,
    location,
    occurredAt,
    status,
    featured,
    updatedAt: now,
    publishedAt: status === "published" ? existing?.publishedAt ?? now : null,
  }

  try {
    let savedId = id
    if (existing) {
      await db.update(portfolioEntries)
        .set(values)
        .where(and(eq(portfolioEntries.id, id), eq(portfolioEntries.userId, userId), eq(portfolioEntries.kind, kind)))
    } else {
      const [saved] = await db.insert(portfolioEntries).values(values).returning({ id: portfolioEntries.id })
      savedId = saved.id
    }

    revalidateContent(kind, slug)
    return { success: "Modificările au fost salvate.", entryId: savedId }
  } catch {
    return { error: "Nu s-a putut salva. Verifică dacă linkul este unic și încearcă din nou." }
  }
}

export async function deleteContentEntry(formData: FormData): Promise<ActionResult> {
  const userId = await requireOwnerId()
  const id = textValue(formData, "id", 80)
  const rawKind = textValue(formData, "kind", 30)
  if (!id || !isContentKind(rawKind)) return { error: "Elementul nu a fost găsit." }

  const [entry] = await db.select({ slug: portfolioEntries.slug })
    .from(portfolioEntries)
    .where(and(eq(portfolioEntries.id, id), eq(portfolioEntries.userId, userId), eq(portfolioEntries.kind, rawKind)))
    .limit(1)

  if (!entry) return { error: "Elementul nu a fost găsit." }

  await db.delete(portfolioEntries)
    .where(and(eq(portfolioEntries.id, id), eq(portfolioEntries.userId, userId), eq(portfolioEntries.kind, rawKind)))
  revalidateContent(rawKind, entry.slug)
  return { success: "Elementul a fost șters." }
}

export async function registerMedia(input: unknown): Promise<PortfolioMedia | null> {
  const userId = await requireOwnerId()
  if (!input || typeof input !== "object") return null

  const payload = input as Record<string, unknown>
  const pathname = typeof payload.pathname === "string" ? payload.pathname : ""
  const urlValue = typeof payload.url === "string" ? payload.url : ""
  const filename = typeof payload.filename === "string" ? payload.filename.trim().slice(0, 240) : ""
  const contentType = typeof payload.contentType === "string" ? payload.contentType : ""
  const byteSize = typeof payload.byteSize === "number" ? payload.byteSize : 0
  const allowedTypes = [...imageTypes, ...videoTypes]

  if (!pathname.startsWith("portfolio/") || pathname.includes("..") || !filename || !allowedTypes.includes(contentType)) return null
  if (!Number.isSafeInteger(byteSize) || byteSize <= 0) return null
  if (imageTypes.includes(contentType) && byteSize > 20 * 1024 * 1024) return null
  if (videoTypes.includes(contentType) && byteSize > 500 * 1024 * 1024) return null

  try {
    const url = new URL(urlValue)
    const urlPathname = decodeURIComponent(url.pathname.replace(/^\//, ""))
    if (url.protocol !== "https:" || !url.hostname.endsWith(".public.blob.vercel-storage.com") || urlPathname !== pathname) return null
  } catch {
    return null
  }

  const [existing] = await db.select({
    id: portfolioMedia.id,
    pathname: portfolioMedia.pathname,
    url: portfolioMedia.url,
    filename: portfolioMedia.filename,
    contentType: portfolioMedia.contentType,
    byteSize: portfolioMedia.byteSize,
    createdAt: portfolioMedia.createdAt,
  })
    .from(portfolioMedia)
    .where(and(eq(portfolioMedia.userId, userId), eq(portfolioMedia.pathname, pathname)))
    .limit(1)

  if (existing) return { ...existing, createdAt: existing.createdAt.toISOString() }

  const [saved] = await db.insert(portfolioMedia).values({
    userId,
    pathname,
    url: urlValue,
    filename,
    contentType,
    byteSize,
  }).returning({
    id: portfolioMedia.id,
    pathname: portfolioMedia.pathname,
    url: portfolioMedia.url,
    filename: portfolioMedia.filename,
    contentType: portfolioMedia.contentType,
    byteSize: portfolioMedia.byteSize,
    createdAt: portfolioMedia.createdAt,
  })

  revalidatePath("/admin")
  return saved ? { ...saved, createdAt: saved.createdAt.toISOString() } : null
}

export async function createTask(formData: FormData): Promise<ActionResult> {
  const userId = await requireOwnerId()
  const title = textValue(formData, "title", 180)
  const description = textValue(formData, "description", 600)
  if (!title) return { error: "Adaugă un titlu pentru task." }

  const [lastTask] = await db.select({ sortOrder: portfolioTasks.sortOrder })
    .from(portfolioTasks)
    .where(eq(portfolioTasks.userId, userId))
    .orderBy(desc(portfolioTasks.sortOrder))
    .limit(1)

  await db.insert(portfolioTasks).values({
    userId,
    title,
    description,
    sortOrder: (lastTask?.sortOrder ?? -1) + 1,
  })

  revalidatePath("/progress")
  revalidatePath("/admin/progress")
  revalidatePath("/admin")
  return { success: "Taskul a fost adăugat." }
}

export async function toggleTask(formData: FormData): Promise<ActionResult> {
  const userId = await requireOwnerId()
  const id = textValue(formData, "id", 80)
  const completed = formData.get("completed") === "true"
  if (!id) return { error: "Taskul nu a fost găsit." }

  await db.update(portfolioTasks)
    .set({ completed, updatedAt: new Date() })
    .where(and(eq(portfolioTasks.id, id), eq(portfolioTasks.userId, userId)))

  revalidatePath("/progress")
  revalidatePath("/admin/progress")
  revalidatePath("/admin")
  return { success: "Progres actualizat." }
}

export async function deleteTask(formData: FormData): Promise<ActionResult> {
  const userId = await requireOwnerId()
  const id = textValue(formData, "id", 80)
  if (!id) return { error: "Taskul nu a fost găsit." }

  await db.delete(portfolioTasks)
    .where(and(eq(portfolioTasks.id, id), eq(portfolioTasks.userId, userId)))

  revalidatePath("/progress")
  revalidatePath("/admin/progress")
  revalidatePath("/admin")
  return { success: "Taskul a fost șters." }
}
