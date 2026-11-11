import { and, asc, desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { portfolioEntries, portfolioMedia, portfolioTasks } from "@/lib/db/schema"
import { getSiteOwnerId } from "@/lib/content/auth"
import type { ContentEntry, ContentKind, PortfolioMedia, PortfolioTask } from "@/lib/content/types"

const entrySelection = {
  id: portfolioEntries.id,
  kind: portfolioEntries.kind,
  slug: portfolioEntries.slug,
  title: portfolioEntries.title,
  excerpt: portfolioEntries.excerpt,
  body: portfolioEntries.body,
  coverUrl: portfolioEntries.coverUrl,
  coverAlt: portfolioEntries.coverAlt,
  videoUrl: portfolioEntries.videoUrl,
  location: portfolioEntries.location,
  occurredAt: portfolioEntries.occurredAt,
  sortOrder: portfolioEntries.sortOrder,
  status: portfolioEntries.status,
  featured: portfolioEntries.featured,
  createdAt: portfolioEntries.createdAt,
  updatedAt: portfolioEntries.updatedAt,
  publishedAt: portfolioEntries.publishedAt,
}

type EntryRow = Omit<typeof portfolioEntries.$inferSelect, "userId">

function toContentEntry(row: EntryRow): ContentEntry {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() ?? null,
  }
}

function toPortfolioTask(row: {
  id: string
  title: string
  description: string
  sortOrder: number
  completed: boolean
  createdAt: Date
  updatedAt: Date
}): PortfolioTask {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function toPortfolioMedia(row: {
  id: string
  pathname: string
  url: string
  filename: string
  contentType: string
  byteSize: number
  createdAt: Date
}): PortfolioMedia {
  return { ...row, createdAt: row.createdAt.toISOString() }
}

export async function getPublicEntries(kind: ContentKind) {
  const userId = await getSiteOwnerId()
  if (!userId) return []

  const rows = await db
    .select(entrySelection)
    .from(portfolioEntries)
    .where(and(
      eq(portfolioEntries.userId, userId),
      eq(portfolioEntries.kind, kind),
      eq(portfolioEntries.status, "published"),
    ))
    .orderBy(asc(portfolioEntries.sortOrder), desc(portfolioEntries.publishedAt), desc(portfolioEntries.createdAt))

  return rows.map(toContentEntry)
}

export async function getPublicEntry(kind: ContentKind, slug: string) {
  const userId = await getSiteOwnerId()
  if (!userId) return null

  const [row] = await db
    .select(entrySelection)
    .from(portfolioEntries)
    .where(and(
      eq(portfolioEntries.userId, userId),
      eq(portfolioEntries.kind, kind),
      eq(portfolioEntries.slug, slug),
      eq(portfolioEntries.status, "published"),
    ))
    .limit(1)

  return row ? toContentEntry(row) : null
}

export async function getAdminEntries(userId: string, kind: ContentKind) {
  const rows = await db
    .select(entrySelection)
    .from(portfolioEntries)
    .where(and(eq(portfolioEntries.userId, userId), eq(portfolioEntries.kind, kind)))
    .orderBy(asc(portfolioEntries.sortOrder), desc(portfolioEntries.updatedAt))

  return rows.map(toContentEntry)
}

export async function getAdminEntry(userId: string, kind: ContentKind, id: string) {
  const [row] = await db
    .select(entrySelection)
    .from(portfolioEntries)
    .where(and(
      eq(portfolioEntries.userId, userId),
      eq(portfolioEntries.kind, kind),
      eq(portfolioEntries.id, id),
    ))
    .limit(1)

  return row ? toContentEntry(row) : null
}

export async function getAdminMedia(userId: string) {
  const rows = await db
    .select({
      id: portfolioMedia.id,
      pathname: portfolioMedia.pathname,
      url: portfolioMedia.url,
      filename: portfolioMedia.filename,
      contentType: portfolioMedia.contentType,
      byteSize: portfolioMedia.byteSize,
      createdAt: portfolioMedia.createdAt,
    })
    .from(portfolioMedia)
    .where(eq(portfolioMedia.userId, userId))
    .orderBy(desc(portfolioMedia.createdAt))

  return rows.map(toPortfolioMedia)
}

export async function getAdminTasks(userId: string) {
  const rows = await db
    .select({
      id: portfolioTasks.id,
      title: portfolioTasks.title,
      description: portfolioTasks.description,
      sortOrder: portfolioTasks.sortOrder,
      completed: portfolioTasks.completed,
      createdAt: portfolioTasks.createdAt,
      updatedAt: portfolioTasks.updatedAt,
    })
    .from(portfolioTasks)
    .where(eq(portfolioTasks.userId, userId))
    .orderBy(asc(portfolioTasks.sortOrder), asc(portfolioTasks.createdAt))

  return rows.map(toPortfolioTask)
}

export async function getPublicTasks() {
  const userId = await getSiteOwnerId()
  if (!userId) return []

  const rows = await db
    .select({
      id: portfolioTasks.id,
      title: portfolioTasks.title,
      description: portfolioTasks.description,
      sortOrder: portfolioTasks.sortOrder,
      completed: portfolioTasks.completed,
      createdAt: portfolioTasks.createdAt,
      updatedAt: portfolioTasks.updatedAt,
    })
    .from(portfolioTasks)
    .where(eq(portfolioTasks.userId, userId))
    .orderBy(asc(portfolioTasks.sortOrder), asc(portfolioTasks.createdAt))

  return rows.map(toPortfolioTask)
}

export async function getAdminSummary(userId: string) {
  const [entries, tasks] = await Promise.all([
    db.select({ kind: portfolioEntries.kind, status: portfolioEntries.status })
      .from(portfolioEntries)
      .where(eq(portfolioEntries.userId, userId)),
    db.select({ completed: portfolioTasks.completed })
      .from(portfolioTasks)
      .where(eq(portfolioTasks.userId, userId)),
  ])

  return {
    entryCount: entries.length,
    publishedCount: entries.filter((entry) => entry.status === "published").length,
    taskCount: tasks.length,
    completedTaskCount: tasks.filter((task) => task.completed).length,
  }
}
