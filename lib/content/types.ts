export const CONTENT_KINDS = ["project", "travel", "vlog", "thought", "tutorial", "service"] as const

export type ContentKind = (typeof CONTENT_KINDS)[number]
export type ContentStatus = "draft" | "published"

export type RichTextMark = {
  type: string
  attrs?: Record<string, unknown>
}

export type RichTextNode = {
  type: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: RichTextMark[]
  content?: RichTextNode[]
}

export type RichTextDocument = RichTextNode & { type: "doc" }

export type ContentMeta = {
  segment: string
  title: string
  description: string
  eyebrow: string
  singular: string
}

export const CONTENT_META: Record<ContentKind, ContentMeta> = {
  project: {
    segment: "projects",
    title: "Proiecte",
    description: "Studii de caz, experimente web și proiecte construite cu grijă.",
    eyebrow: "Portofoliu",
    singular: "proiect",
  },
  travel: {
    segment: "travels",
    title: "Călătorii",
    description: "Fotografii și povești adunate pe drum.",
    eyebrow: "Jurnal de călătorie",
    singular: "călătorie",
  },
  vlog: {
    segment: "vlogs",
    title: "Vloguri",
    description: "Fragmente video, povești și momente din culise.",
    eyebrow: "Jurnal video",
    singular: "vlog",
  },
  thought: {
    segment: "thoughts",
    title: "Gânduri",
    description: "Notițe, eseuri scurte și idei care merită păstrate.",
    eyebrow: "Caiet de idei",
    singular: "text",
  },
  tutorial: {
    segment: "tutorials",
    title: "Tutoriale",
    description: "Lecții video și ghiduri despre design, dezvoltare și instrumente digitale.",
    eyebrow: "Învață împreună cu mine",
    singular: "tutorial",
  },
  service: {
    segment: "services",
    title: "Servicii",
    description: "Inginerie biomedicală, dezvoltare web full-stack și creație de conținut.",
    eyebrow: "Colaborări",
    singular: "serviciu",
  },
}

export const CONTENT_KIND_BY_SEGMENT: Record<string, ContentKind> = {
  projects: "project",
  travels: "travel",
  vlogs: "vlog",
  thoughts: "thought",
  tutorials: "tutorial",
  services: "service",
}

export function contentKindFromSegment(segment: string): ContentKind | null {
  return CONTENT_KIND_BY_SEGMENT[segment] ?? null
}

export type ContentEntry = {
  id: string
  kind: ContentKind
  slug: string
  title: string
  excerpt: string
  body: RichTextDocument
  coverUrl: string | null
  coverAlt: string
  videoUrl: string | null
  location: string | null
  occurredAt: string | null
  sortOrder: number
  status: ContentStatus
  featured: boolean
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

export type PortfolioTask = {
  id: string
  title: string
  description: string
  sortOrder: number
  completed: boolean
  createdAt: string
  updatedAt: string
}

export type SlotStatus = "new vlog" | "new tasks" | "nothing new"

export type HeroSlotData = {
  status: SlotStatus
  vlog: { title: string; href: string; coverUrl: string | null; coverAlt: string } | null
  newTaskCount: number
}

export type PortfolioMedia = {
  id: string
  pathname: string
  url: string
  filename: string
  contentType: string
  byteSize: number
  createdAt: string
}
