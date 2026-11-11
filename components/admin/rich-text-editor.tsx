"use client"

import { useEffect } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { Bold, Heading2, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Strikethrough } from "lucide-react"
import type { RichTextDocument } from "@/lib/content/types"

type ImageInserter = (url: string, alt: string) => void

type Props = {
  initialDocument: RichTextDocument
  onChange: (value: string) => void
  onImageInserterReady: (insertImage: ImageInserter) => void
}

export function RichTextEditor({ initialDocument, onChange, onImageInserterReady }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder: "Scrie povestea, ideea sau pașii tutorialului…" }),
    ],
    content: initialDocument,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => onChange(JSON.stringify(currentEditor.getJSON())),
  })

  useEffect(() => {
    if (!editor) return
    onImageInserterReady((url, alt) => {
      editor.chain().focus().setImage({ src: url, alt }).run()
    })
  }, [editor, onImageInserterReady])

  if (!editor) return <div className="rich-editor-surface rich-editor-loading" aria-busy="true">Se încarcă editorul…</div>

  function addLink() {
    const currentHref = editor!.getAttributes("link").href as string | undefined
    const href = window.prompt("Adaugă un link HTTPS sau email", currentHref ?? "https://")
    if (href === null) return
    const value = href.trim()
    if (!value) {
      editor!.chain().focus().unsetLink().run()
      return
    }

    try {
      const parsed = new URL(value)
      if (!["https:", "http:", "mailto:"].includes(parsed.protocol)) return
      editor!.chain().focus().extendMarkRange("link").setLink({ href: value }).run()
    } catch {
      return
    }
  }

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar" role="toolbar" aria-label="Formatarea textului">
        <button type="button" aria-label="Îngroașă textul" aria-pressed={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold aria-hidden="true" /></button>
        <button type="button" aria-label="Text italic" aria-pressed={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic aria-hidden="true" /></button>
        <button type="button" aria-label="Text tăiat" aria-pressed={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough aria-hidden="true" /></button>
        <span className="rich-editor-divider" aria-hidden="true" />
        <button type="button" aria-label="Titlu de secțiune" aria-pressed={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 aria-hidden="true" /></button>
        <button type="button" aria-label="Listă cu puncte" aria-pressed={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List aria-hidden="true" /></button>
        <button type="button" aria-label="Listă numerotată" aria-pressed={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered aria-hidden="true" /></button>
        <button type="button" aria-label="Citat" aria-pressed={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote aria-hidden="true" /></button>
        <button type="button" aria-label="Adaugă sau editează un link" aria-pressed={editor.isActive("link")} onClick={addLink}><Link2 aria-hidden="true" /></button>
        <span className="rich-editor-hint"><ImagePlus aria-hidden="true" />Adaugă imagini din biblioteca media de mai jos.</span>
      </div>
      <EditorContent editor={editor} className="rich-editor-surface" aria-label="Editor de text bogat" />
    </div>
  )
}
