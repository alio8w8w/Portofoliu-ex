import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowUpRight, CheckCircle2, FileText, FolderOpen, Images } from "lucide-react"
import { getOwnerSession } from "@/lib/content/auth"
import { getAdminSummary } from "@/lib/content/queries"
import { CONTENT_KINDS, CONTENT_META } from "@/lib/content/types"

export const metadata: Metadata = { title: "Panou de administrare" }

const categoryDescriptions = {
  project: "Studii de caz și proiecte web.",
  travel: "Fotografii și povești de călătorie.",
  vlog: "Jurnale video și momente din culise.",
  thought: "Eseuri, fragmente și notițe.",
  tutorial: "Lecții video și ghiduri practice.",
  service: "Servicii de inginerie, web și conținut.",
} as const

export default async function AdminDashboardPage() {
  const owner = await getOwnerSession()
  if (!owner) redirect("/admin/sign-in")

  const summary = await getAdminSummary(owner.userId)

  return (
    <main className="admin-main">
      <section className="admin-welcome">
        <div>
          <span className="admin-eyebrow">Spațiul tău creativ</span>
          <h1>Panoul de administrare<span>.</span></h1>
          <p>Editează portofoliul, adaugă povești și urmărește-ți progresul. Modificările se salvează în Neon; fișierele media merg în Blob.</p>
        </div>
        <Link className="admin-primary-button admin-welcome-action" href="/">
          Deschide portofoliul <ArrowUpRight aria-hidden="true" />
        </Link>
      </section>

      <section className="admin-stat-grid" aria-label="Rezumat">
        <article className="admin-stat-card"><span><FileText aria-hidden="true" />Conținut publicat</span><strong>{summary.publishedCount}</strong><small>din {summary.entryCount} materiale</small></article>
        <article className="admin-stat-card"><span><CheckCircle2 aria-hidden="true" />Taskuri finalizate</span><strong>{summary.completedTaskCount}<small className="admin-stat-total"> / {summary.taskCount}</small></strong><small>progres personal</small></article>
        <article className="admin-stat-card"><span><Images aria-hidden="true" />Bibliotecă media</span><strong>Blob</strong><small>imagini și video</small></article>
      </section>

      <section className="admin-section-heading">
        <div><span className="admin-eyebrow">Organizează conținutul</span><h2>Pagini și colecții</h2></div>
        <span className="admin-section-count">06 categorii</span>
      </section>
      <section className="admin-category-grid" aria-label="Categorii de conținut">
        {CONTENT_KINDS.map((kind, index) => (
          <Link className={`admin-category-card admin-category-${index + 1}`} key={kind} href={`/admin/${CONTENT_META[kind].segment}`}>
            <span className="admin-category-number">0{index + 1}</span>
            <span className="admin-category-icon" aria-hidden="true"><FolderOpen /></span>
            <strong>{CONTENT_META[kind].title}</strong>
            <small>{categoryDescriptions[kind]}</small>
            <ArrowUpRight className="admin-category-arrow" aria-hidden="true" />
          </Link>
        ))}
        <Link className="admin-category-card admin-category-progress" href="/admin/progress">
          <span className="admin-category-number">07</span>
          <span className="admin-category-icon" aria-hidden="true"><CheckCircle2 /></span>
          <strong>Taskuri & progres</strong>
          <small>Planifică pașii și urmărește bara de progres.</small>
          <ArrowUpRight className="admin-category-arrow" aria-hidden="true" />
        </Link>
      </section>
    </main>
  )
}
