import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { ContentManager } from "@/components/admin/content-manager"
import { getOwnerSession } from "@/lib/content/auth"
import { getAdminEntries, getAdminEntry, getAdminMedia } from "@/lib/content/queries"
import { CONTENT_KIND_BY_SEGMENT } from "@/lib/content/types"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Editor de conținut" }

export default async function AdminContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string }>
  searchParams: Promise<{ edit?: string }>
}) {
  const [{ kind: segment }, { edit }] = await Promise.all([params, searchParams])
  const kind = CONTENT_KIND_BY_SEGMENT[segment]
  if (!kind) notFound()

  const owner = await getOwnerSession()
  if (!owner) redirect("/admin/sign-in")

  const [entries, media, initialEntry] = await Promise.all([
    getAdminEntries(owner.userId, kind),
    getAdminMedia(owner.userId),
    edit ? getAdminEntry(owner.userId, kind, edit) : Promise.resolve(null),
  ])

  return <ContentManager key={`${kind}-${edit ?? "new"}`} kind={kind} entries={entries} media={media} initialEntry={initialEntry} />
}
