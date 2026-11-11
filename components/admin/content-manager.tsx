"use client"

import { useCallback, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowUpRight, Check, Eye, FilePlus2, Trash2 } from "lucide-react"
import { deleteContentEntry, saveContentEntry } from "@/lib/content/actions"
import { CONTENT_META, type ContentEntry, type ContentKind, type PortfolioMedia, type RichTextDocument } from "@/lib/content/types"
import { MediaLibrary } from "@/components/admin/media-library"
import { RichTextEditor } from "@/components/admin/rich-text-editor"

type Props = {
  kind: ContentKind
  entries: ContentEntry[]
  media: PortfolioMedia[]
  initialEntry: ContentEntry | null
}

const emptyDocument: RichTextDocument = { type: "doc", content: [{ type: "paragraph" }] }

export function ContentManager({ kind, entries, media, initialEntry }: Props) {
  const router = useRouter()
  const meta = CONTENT_META[kind]
  const imageInserter = useRef<((url: string, alt: string) => void) | null>(null)
  const [body, setBody] = useState(JSON.stringify(initialEntry?.body ?? emptyDocument))
  const [coverUrl, setCoverUrl] = useState(initialEntry?.coverUrl ?? "")
  const [coverAlt, setCoverAlt] = useState(initialEntry?.coverAlt ?? "")
  const [videoUrl, setVideoUrl] = useState(initialEntry?.videoUrl ?? "")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const registerImageInserter = useCallback((insertImage: (url: string, alt: string) => void) => {
    imageInserter.current = insertImage
  }, [])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage("")
    setError("")
    const formData = new FormData(event.currentTarget)
    formData.set("body", body)

    try {
      const result = await saveContentEntry(formData)
      if (result.error) {
        setError(result.error)
        return
      }

      setMessage(result.success ?? "Salvat.")
      if (result.entryId) {
        router.replace(`/admin/${meta.segment}?edit=${result.entryId}`, { scroll: false })
        router.refresh()
      }
    } catch {
      setError("Nu s-a putut salva. Reîncarcă pagina și încearcă din nou.")
    } finally {
      setPending(false)
    }
  }

  async function remove(entry: ContentEntry) {
    if (!window.confirm(`Ștergi „${entry.title}”? Această acțiune nu poate fi anulată.`)) return
    const formData = new FormData()
    formData.set("id", entry.id)
    formData.set("kind", kind)
    const result = await deleteContentEntry(formData)
    setMessage(result.error ?? result.success ?? "")
    if (initialEntry?.id === entry.id) router.replace(`/admin/${meta.segment}`, { scroll: false })
    router.refresh()
  }

  return (
    <main className="admin-main admin-editor-main">
      <section className="admin-page-heading">
        <div><span className="admin-eyebrow">Editor de conținut</span><h1>{meta.title}<span>.</span></h1><p>{meta.description}</p></div>
        <Link className="admin-outline-button" href={`/${meta.segment}`} target="_blank" rel="noreferrer"><Eye aria-hidden="true" />Vezi pagina publică</Link>
      </section>

      <div className="admin-editor-layout">
        <section className="admin-editor-panel" aria-labelledby="entry-editor-title">
          <div className="admin-section-heading"><div><span className="admin-eyebrow">{initialEntry ? "Editează materialul" : "Material nou"}</span><h2 id="entry-editor-title">{initialEntry?.title ?? `Adaugă ${meta.singular}`}</h2></div><FilePlus2 aria-hidden="true" /></div>
          <form className="admin-content-form" onSubmit={save}>
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="id" value={initialEntry?.id ?? ""} />
            <input type="hidden" name="body" value={body} readOnly />
            <input type="hidden" name="coverUrl" value={coverUrl} readOnly />

            <div className="admin-form-two-col">
              <label>Titlu <span aria-hidden="true">*</span><input name="title" defaultValue={initialEntry?.title ?? ""} required maxLength={180} placeholder="Un titlu clar și memorabil" /></label>
              <label>Link personalizat<input name="slug" defaultValue={initialEntry?.slug ?? ""} maxLength={180} placeholder="Se creează din titlu dacă rămâne gol" /></label>
            </div>
            <label>Descriere scurtă<textarea name="excerpt" defaultValue={initialEntry?.excerpt ?? ""} maxLength={600} rows={3} placeholder="O introducere care apare pe pagina colecției…" /></label>

            {(kind === "travel" || kind === "vlog") && (
              <div className="admin-form-two-col">
                <label>{kind === "travel" ? "Loc" : "Locație"}<input name="location" defaultValue={initialEntry?.location ?? ""} maxLength={160} placeholder="Ex.: Iași, România" /></label>
                <label>{kind === "travel" ? "Data călătoriei" : "Data înregistrării"}<input name="occurredAt" type="date" defaultValue={initialEntry?.occurredAt ?? ""} /></label>
              </div>
            )}
            {kind === "tutorial" && <label>Data publicării<input name="occurredAt" type="date" defaultValue={initialEntry?.occurredAt ?? ""} /></label>}

            {coverUrl && (
              <div className="admin-cover-preview">
                <img src={coverUrl} alt={coverAlt} />
                <div><strong>Copertă selectată</strong><button type="button" onClick={() => { setCoverUrl(""); setCoverAlt("") }}>Elimină coperta</button></div>
              </div>
            )}
            <label>Text alternativ pentru copertă{coverUrl && <span aria-hidden="true"> *</span>}<input name="coverAlt" value={coverAlt} onChange={(event) => setCoverAlt(event.target.value)} maxLength={240} placeholder="Descrie imaginea pentru cititoarele de ecran" /></label>

            {(kind === "tutorial" || kind === "vlog") && (
              <label>Video atașat<input name="videoUrl" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} maxLength={2048} placeholder="Încarcă un video mai jos sau adaugă un link YouTube/Vimeo" /></label>
            )}

            <fieldset className="admin-editor-fieldset">
              <legend>Text principal</legend>
              <RichTextEditor initialDocument={initialEntry?.body ?? emptyDocument} onChange={setBody} onImageInserterReady={registerImageInserter} />
            </fieldset>

            <div className="admin-form-options">
              <label className="admin-checkbox"><input type="checkbox" name="featured" defaultChecked={initialEntry?.featured ?? false} />Evidențiază pe pagina colecției</label>
              <label>Stare<select name="status" defaultValue={initialEntry?.status ?? "draft"}><option value="draft">Ciornă</option><option value="published">Publicat</option></select></label>
            </div>

            {error && <p className="admin-form-error" role="alert">{error}</p>}
            {message && <p className="admin-inline-status" role="status">{message}</p>}
            <div className="admin-editor-submit-row">
              <button className="admin-primary-button" type="submit" disabled={pending}>{pending ? "Se salvează…" : initialEntry ? "Salvează modificările" : "Salvează materialul"}<Check aria-hidden="true" /></button>
              {initialEntry?.status === "published" && <span className="admin-published-note">Vizibil public</span>}
            </div>
          </form>

          <MediaLibrary
            kind={kind}
            initialMedia={media}
            onInsertImage={(item, alt) => imageInserter.current?.(item.url, alt)}
            onSelectCover={(item) => { setCoverUrl(item.url); setCoverAlt((value) => value || item.filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ")) }}
            onSelectVideo={(item) => setVideoUrl(item.url)}
          />
        </section>

        <aside className="admin-entry-list" aria-labelledby="entry-list-title">
          <div className="admin-section-heading"><div><span className="admin-eyebrow">Conținutul tău</span><h2 id="entry-list-title">Materiale</h2></div><span className="admin-section-count">{entries.length}</span></div>
          {entries.length === 0 ? (
            <div className="admin-empty-state"><FilePlus2 aria-hidden="true" /><p>Nu ai creat încă materiale în această categorie.</p></div>
          ) : (
            <ul>
              {entries.map((entry) => (
                <li className={initialEntry?.id === entry.id ? "is-selected" : ""} key={entry.id}>
                  <Link href={`/admin/${meta.segment}?edit=${entry.id}`} scroll={false}>
                    <span className={`admin-status-dot ${entry.status}`} aria-hidden="true" />
                    <span><strong>{entry.title}</strong><small>{entry.status === "published" ? "Publicat" : "Ciornă"}</small></span>
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                  <button className="admin-icon-button" type="button" aria-label={`Șterge ${entry.title}`} onClick={() => remove(entry)}><Trash2 aria-hidden="true" /></button>
                </li>
              ))}
            </ul>
          )}
          <Link className="admin-new-entry-link" href={`/admin/${meta.segment}`}><FilePlus2 aria-hidden="true" />Creează alt material</Link>
          {message && <p className="admin-inline-status" role="status">{message}</p>}
        </aside>
      </div>
    </main>
  )
}
