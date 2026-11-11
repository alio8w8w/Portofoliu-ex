import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ContentIndexPage } from "@/components/content/content-pages"
import { contentKindFromSegment, CONTENT_META } from "@/lib/content/types"
import { getPublicEntries } from "@/lib/content/queries"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ contentKind: string }> }): Promise<Metadata> {
  const { contentKind } = await params
  const kind = contentKindFromSegment(contentKind)
  if (!kind) return { title: "Pagină negăsită" }
  return { title: CONTENT_META[kind].title, description: CONTENT_META[kind].description }
}

export default async function ContentCategoryRoute({ params }: { params: Promise<{ contentKind: string }> }) {
  const { contentKind } = await params
  const kind = contentKindFromSegment(contentKind)
  if (!kind) notFound()

  const entries = await getPublicEntries(kind)
  return <ContentIndexPage kind={kind} entries={entries} />
}
