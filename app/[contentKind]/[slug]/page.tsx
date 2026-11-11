import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ContentDetailPage } from "@/components/content/content-pages"
import { contentKindFromSegment, CONTENT_META } from "@/lib/content/types"
import { getPublicEntry } from "@/lib/content/queries"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ contentKind: string; slug: string }> }): Promise<Metadata> {
  const { contentKind, slug } = await params
  const kind = contentKindFromSegment(contentKind)
  if (!kind) return { title: "Pagină negăsită" }

  const entry = await getPublicEntry(kind, slug)
  if (!entry) return { title: "Pagină negăsită" }
  return { title: entry.title, description: entry.excerpt || CONTENT_META[kind].description }
}

export default async function ContentEntryRoute({ params }: { params: Promise<{ contentKind: string; slug: string }> }) {
  const { contentKind, slug } = await params
  const kind = contentKindFromSegment(contentKind)
  if (!kind) notFound()

  const entry = await getPublicEntry(kind, slug)
  if (!entry) notFound()
  return <ContentDetailPage kind={kind} entry={entry} />
}
