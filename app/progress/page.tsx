import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react"
import { ContentHeader } from "@/components/content/content-pages"
import { getPublicTasks } from "@/lib/content/queries"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Progres",
  description: "Urmărește taskurile și pașii mici din parcursul creativ al Ilinei.",
}

export default async function ProgressPage() {
  const tasks = await getPublicTasks()
  const completed = tasks.filter((task) => task.completed).length
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0

  return (
    <div className="content-site">
      <ContentHeader />
      <main className="progress-public-main">
        <Link className="content-back-link" href="/"><ArrowLeft aria-hidden="true" /> Înapoi la portofoliu</Link>
        <section className="progress-public-hero">
          <span className="content-eyebrow"><span />Pași mici, progres real</span>
          <h1>În lucru<span>.</span></h1>
          <p>O listă vie de obiective, lucruri învățate și momente în care merită să mă opresc și să verific cât am crescut.</p>
        </section>

        <section className="progress-public-card" aria-label="Progresul obiectivelor">
          <div className="progress-public-summary"><div><span>Progres total</span><strong>{percent}<small>%</small></strong></div><span>{completed} din {tasks.length} obiective finalizate</span></div>
          <progress className="public-progress-bar" value={percent} max={100} aria-label={`Progres ${percent}%`} />
          {tasks.length > 0 && percent === 100 ? (
            <div className="progress-exam-message" role="status"><CheckCircle2 aria-hidden="true" /><div><strong>Urmează examenul de verificare.</strong><p>Toate obiectivele sunt gata. E timpul să verific progresul și să aleg următoarea provocare.</p></div></div>
          ) : tasks.length === 0 ? (
            <p className="progress-empty-note">Lista de obiective va apărea aici în curând.</p>
          ) : (
            <p className="progress-empty-note">Fiecare obiectiv bifat mă apropie de următorul pas.</p>
          )}
        </section>

        {tasks.length > 0 && (
          <section className="progress-public-list" aria-labelledby="progress-list-title">
            <div className="content-list-heading"><h2 id="progress-list-title">Obiectivele mele</h2><span>{tasks.length.toString().padStart(2, "0")} pași</span></div>
            <ul>
              {tasks.map((task) => (
                <li key={task.id} className={task.completed ? "is-complete" : ""}>
                  {task.completed ? <CheckCircle2 aria-hidden="true" /> : <Circle aria-hidden="true" />}
                  <div><strong>{task.title}</strong>{task.description && <p>{task.description}</p>}</div>
                  <span>{task.completed ? "Finalizat" : "În lucru"}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
