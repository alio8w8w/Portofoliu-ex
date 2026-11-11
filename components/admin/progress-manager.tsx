"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Check, Circle, Plus, Trash2 } from "lucide-react"
import { createTask, deleteTask, toggleTask } from "@/lib/content/actions"
import type { PortfolioTask } from "@/lib/content/types"

export function ProgressManager({ tasks }: { tasks: PortfolioTask[] }) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState(false)
  const completed = tasks.filter((task) => task.completed).length
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage("")
    const form = event.currentTarget
    const result = await createTask(new FormData(form))
    setPending(false)
    setMessage(result.error ?? result.success ?? "")
    if (result.success) {
      form.reset()
      router.refresh()
    }
  }

  async function changeTask(task: PortfolioTask) {
    const formData = new FormData()
    formData.set("id", task.id)
    formData.set("completed", String(!task.completed))
    const result = await toggleTask(formData)
    setMessage(result.error ?? result.success ?? "")
    router.refresh()
  }

  async function removeTask(task: PortfolioTask) {
    if (!window.confirm(`Ștergi taskul „${task.title}”?`)) return
    const formData = new FormData()
    formData.set("id", task.id)
    const result = await deleteTask(formData)
    setMessage(result.error ?? result.success ?? "")
    router.refresh()
  }

  return (
    <main className="admin-main admin-progress-main">
      <section className="admin-page-heading">
        <div><span className="admin-eyebrow">Obiective personale</span><h1>Taskuri & progres<span>.</span></h1><p>Adaugă pași mici, marchează ce ai terminat și urmărește progresul public.</p></div>
      </section>

      <section className="admin-progress-card" aria-label="Progresul taskurilor">
        <div className="admin-progress-card-top"><div><span>Progres total</span><strong>{percent}%</strong></div><span>{completed} din {tasks.length} finalizate</span></div>
        <progress className="admin-progress-bar" value={percent} max={100} aria-label={`Progres ${percent}%`} />
        {tasks.length > 0 && percent === 100 && <p className="admin-exam-note">Ai ajuns la 100% — e timpul pentru un examen de verificare a progresului.</p>}
      </section>

      <section className="admin-task-layout">
        <form className="admin-task-form" onSubmit={addTask}>
          <span className="admin-eyebrow">Următorul pas</span>
          <h2>Adaugă un task</h2>
          <label htmlFor="task-title">Titlu</label>
          <input id="task-title" name="title" required maxLength={180} placeholder="Ex.: Termină proiectul de biologie" />
          <label htmlFor="task-description">Notiță <span>(opțional)</span></label>
          <textarea id="task-description" name="description" maxLength={600} rows={3} placeholder="Un detaliu care te ajută să începi…" />
          <button className="admin-primary-button" type="submit" disabled={pending}><Plus aria-hidden="true" />{pending ? "Se adaugă…" : "Adaugă task"}</button>
          {message && <p className="admin-inline-status" role="status">{message}</p>}
        </form>

        <section className="admin-task-list" aria-labelledby="admin-task-list-title">
          <div className="admin-section-heading"><div><span className="admin-eyebrow">Planul tău</span><h2 id="admin-task-list-title">Lista de taskuri</h2></div><span className="admin-section-count">{tasks.length} taskuri</span></div>
          {tasks.length === 0 ? (
            <div className="admin-empty-state"><Circle aria-hidden="true" /><p>Lista este goală. Adaugă primul tău task.</p></div>
          ) : (
            <ul className="admin-task-items">
              {tasks.map((task) => (
                <li className={task.completed ? "is-complete" : ""} key={task.id}>
                  <button className="admin-task-toggle" type="button" aria-label={task.completed ? `Marchează ca nefinalizat: ${task.title}` : `Marchează ca finalizat: ${task.title}`} aria-pressed={task.completed} onClick={() => changeTask(task)}>
                    {task.completed ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}
                  </button>
                  <div className="admin-task-copy"><strong>{task.title}</strong>{task.description && <p>{task.description}</p>}</div>
                  <button className="admin-icon-button" type="button" aria-label={`Șterge taskul: ${task.title}`} onClick={() => removeTask(task)}><Trash2 aria-hidden="true" /></button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  )
}
