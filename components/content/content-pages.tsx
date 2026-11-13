import Link from "next/link"
import { ArrowLeft, ArrowUpRight, Play, Sparkles } from "lucide-react"
import { CONTENT_META, type ContentEntry, type ContentKind } from "@/lib/content/types"
import { RichTextRenderer } from "@/components/content/rich-text-renderer"

function formatDate(value: string | null) {
  if (!value) return null
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00Z`)
  return new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric" }).format(date)
}

function ContentFooter() {
  return (
    <footer className="content-footer">
      <Link className="content-footer-mark" href="/">i<span>.</span></Link>
      <p>Creată cu curiozitate și puțină culoare în plus.</p>
      <Link href="/#home">Înapoi sus <ArrowUpRight aria-hidden="true" /></Link>
    </footer>
  )
}

function EntryCard({ entry, kind }: { entry: ContentEntry; kind: ContentKind }) {
  const meta = CONTENT_META[kind]
  const date = formatDate(entry.occurredAt ?? entry.publishedAt)

  return (
    <article className="content-card">
      <Link className="content-card-link" href={`/${meta.segment}/${entry.slug}`} aria-label={`Deschide: ${entry.title}`}>
        <div className={`content-card-art content-card-art-${kind}`}>
          {entry.coverUrl ? (
            <img src={entry.coverUrl} alt={entry.coverAlt} loading="lazy" />
          ) : (
            <div className="content-card-placeholder" aria-hidden="true">
              {kind === "tutorial" || kind === "vlog" ? <Play /> : <Sparkles />}
            </div>
          )}
          {entry.videoUrl && <span className="content-card-play" aria-hidden="true"><Play /></span>}
        </div>
        <div className="content-card-copy">
          <div className="content-card-meta">
            {entry.location && <span>{entry.location}</span>}
            {date && <time dateTime={entry.occurredAt ?? entry.publishedAt ?? undefined}>{date}</time>}
          </div>
          <h2>{entry.title}</h2>
          {entry.excerpt && <p>{entry.excerpt}</p>}
          <span className="content-card-read">Citește mai mult <ArrowUpRight aria-hidden="true" /></span>
        </div>
      </Link>
    </article>
  )
}

function ServicesOverview() {
  const services = [
    { number: "01", title: "Inginerie biomedicală", text: "Sprijin pentru proiecte și idei la intersecția dintre sănătate, inginerie și tehnologie." },
    { number: "02", title: "Website-uri Full-Stack", text: "Design și dezvoltare de experiențe web responsive, de la idee până la implementare." },
    { number: "03", title: "Creare și editare de conținut", text: "Organizare și editare de materiale pentru o comunicare clară și coerentă." },
  ]

  return (
    <section className="services-overview" aria-label="Servicii disponibile">
      <div className="content-list-heading"><h2>Cu ce te pot ajuta</h2><span>03 direcții</span></div>
      <div className="services-overview-grid">
        {services.map((service) => (
          <article className="services-overview-card" key={service.number}>
            <span>{service.number}</span>
            <h3>{service.title}</h3>
            <p>{service.text}</p>
          </article>
        ))}
      </div>
      <Link className="services-overview-cta" href="/#contact">Povestește-mi despre proiectul tău <ArrowUpRight aria-hidden="true" /></Link>
    </section>
  )
}

export function ContentIndexPage({ kind, entries }: { kind: ContentKind; entries: ContentEntry[] }) {
  const meta = CONTENT_META[kind]

  return (
    <div className="content-site">
      <main className="content-main">
        <section className={`content-hero content-hero-${kind}`}>
          <span className="content-eyebrow"><span />{meta.eyebrow}</span>
          <h1>{meta.title}<span>.</span></h1>
          <p>{meta.description}</p>
          <span className="content-hero-note">Chișinău <span aria-hidden="true">✳</span> Moldova</span>
        </section>

        {kind === "service" && <ServicesOverview />}
        {entries.length > 0 ? (
          <section className="content-list-section" aria-label={`Materiale publicate: ${meta.title}`}>
            <div className="content-list-heading">
              <h2>Ultimele povești</h2>
              <span>{String(entries.length).padStart(2, "0")} materiale</span>
            </div>
            <div className="content-grid">
              {entries.map((entry) => <EntryCard key={entry.id} entry={entry} kind={kind} />)}
            </div>
          </section>
        ) : kind === "service" ? null : (
          <section className="content-empty" aria-live="polite">
            <span className="content-empty-icon" aria-hidden="true"><Sparkles /></span>
            <h2>Se pregătește ceva frumos.</h2>
            <p>Nu există încă materiale publicate în această categorie. Revino curând.</p>
            <Link className="content-text-link" href="/">Înapoi la portofoliu <ArrowLeft aria-hidden="true" /></Link>
          </section>
        )}
      </main>
      <ContentFooter />
    </div>
  )
}

function getVideoEmbed(videoUrl: string) {
  try {
    const url = new URL(videoUrl)
    const host = url.hostname.toLowerCase()
    if (host.endsWith(".public.blob.vercel-storage.com")) return { type: "file" as const, src: url.toString() }

    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) {
      const id = url.searchParams.get("v")
      if (id && /^[\w-]{11}$/.test(id)) return { type: "embed" as const, src: `https://www.youtube-nocookie.com/embed/${id}` }
    }

    if (host === "youtu.be") {
      const id = url.pathname.slice(1)
      if (/^[\w-]{11}$/.test(id)) return { type: "embed" as const, src: `https://www.youtube-nocookie.com/embed/${id}` }
    }

    if (host === "vimeo.com" || host === "www.vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean).at(-1)
      if (id && /^\d+$/.test(id)) return { type: "embed" as const, src: `https://player.vimeo.com/video/${id}` }
    }
  } catch {
    return null
  }

  return null
}

function VideoPlayer({ entry }: { entry: ContentEntry }) {
  if (!entry.videoUrl) return null
  const video = getVideoEmbed(entry.videoUrl)
  if (!video) return null

  return (
    <div className="content-video-frame">
      {video.type === "file" ? (
        <video controls playsInline preload="metadata" aria-label={`Video: ${entry.title}`}>
          <source src={video.src} />
          Browserul tău nu poate reda acest video.
        </video>
      ) : (
        <iframe
          src={video.src}
          title={`Video: ${entry.title}`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      )}
    </div>
  )
}

export function ContentDetailPage({ kind, entry }: { kind: ContentKind; entry: ContentEntry }) {
  const meta = CONTENT_META[kind]
  const date = formatDate(entry.occurredAt ?? entry.publishedAt)

  return (
    <div className="content-site">
      <main className="content-detail-main">
        <Link className="content-back-link" href={`/${meta.segment}`}><ArrowLeft aria-hidden="true" /> Înapoi la {meta.title.toLowerCase()}</Link>
        <article>
          <header className="content-detail-heading">
            <span className="content-eyebrow"><span />{entry.location || meta.eyebrow}</span>
            <h1>{entry.title}</h1>
            {entry.excerpt && <p className="content-detail-excerpt">{entry.excerpt}</p>}
            {date && <time dateTime={entry.occurredAt ?? entry.publishedAt ?? undefined}>{date}</time>}
          </header>
          {entry.coverUrl && (
            <figure className="content-detail-cover">
              <img src={entry.coverUrl} alt={entry.coverAlt} />
            </figure>
          )}
          <VideoPlayer entry={entry} />
          <RichTextRenderer document={entry.body} />
        </article>
        <Link className="content-detail-end" href={`/${meta.segment}`}><ArrowLeft aria-hidden="true" /> Mai multe {meta.title.toLowerCase()}</Link>
      </main>
      <ContentFooter />
    </div>
  )
}
