import type { ReactNode } from "react"
import type { RichTextDocument, RichTextNode } from "@/lib/content/types"

function safeHref(value: unknown) {
  if (typeof value !== "string") return null
  const href = value.trim()
  if ((href.startsWith("/") && !href.startsWith("//")) || href.startsWith("#")) return href

  try {
    const url = new URL(href)
    return ["https:", "http:", "mailto:", "tel:"].includes(url.protocol) ? href : null
  } catch {
    return null
  }
}

function renderText(node: RichTextNode, key: string): ReactNode {
  let content: ReactNode = node.text ?? ""

  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") content = <strong key={`${key}-bold`}>{content}</strong>
    if (mark.type === "italic") content = <em key={`${key}-italic`}>{content}</em>
    if (mark.type === "strike") content = <s key={`${key}-strike`}>{content}</s>
    if (mark.type === "code") content = <code key={`${key}-code`}>{content}</code>
    if (mark.type === "link") {
      const href = safeHref(mark.attrs?.href)
      if (href) content = <a key={`${key}-link`} href={href} rel="noreferrer" target="_blank">{content}</a>
    }
  }

  return <span key={key}>{content}</span>
}

function renderNode(node: RichTextNode, key: string): ReactNode {
  if (node.type === "text") return renderText(node, key)
  const children = (node.content ?? []).map((child, index) => renderNode(child, `${key}-${index}`))

  switch (node.type) {
    case "doc": return <>{children}</>
    case "paragraph": return <p key={key}>{children}</p>
    case "heading": {
      const level = Number(node.attrs?.level)
      if (level === 1) return <h2 key={key}>{children}</h2>
      if (level === 2) return <h3 key={key}>{children}</h3>
      return <h4 key={key}>{children}</h4>
    }
    case "bulletList": return <ul key={key}>{children}</ul>
    case "orderedList": return <ol key={key}>{children}</ol>
    case "listItem": return <li key={key}>{children}</li>
    case "blockquote": return <blockquote key={key}>{children}</blockquote>
    case "codeBlock": return <pre key={key}><code>{children}</code></pre>
    case "horizontalRule": return <hr key={key} />
    case "hardBreak": return <br key={key} />
    case "image": {
      const src = safeHref(node.attrs?.src)
      if (!src || (!src.startsWith("/") && !src.startsWith("https://"))) return null
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : ""
      return <figure key={key}><img src={src} alt={alt} loading="lazy" /></figure>
    }
    default: return <>{children}</>
  }
}

export function RichTextRenderer({ document }: { document: RichTextDocument }) {
  return <div className="rich-content">{renderNode(document, "document")}</div>
}
