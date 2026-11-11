"use client"

import { useRef, useState, type ChangeEvent } from "react"
import { upload } from "@vercel/blob/client"
import { ImagePlus, LoaderCircle, Play, Upload } from "lucide-react"
import { registerMedia } from "@/lib/content/actions"
import type { ContentKind, PortfolioMedia } from "@/lib/content/types"

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"]

type Props = {
  kind: ContentKind
  initialMedia: PortfolioMedia[]
  onInsertImage: (media: PortfolioMedia, alt: string) => void
  onSelectCover: (media: PortfolioMedia) => void
  onSelectVideo: (media: PortfolioMedia) => void
}

function readableFilename(filename: string) {
  return filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim()
}

export function MediaLibrary({ kind, initialMedia, onInsertImage, onSelectCover, onSelectVideo }: Props) {
  const imageInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)
  const [media, setMedia] = useState(initialMedia)
  const [imageAlt, setImageAlt] = useState("")
  const [uploadType, setUploadType] = useState<"image" | "video" | null>(null)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState("")

  async function handleUpload(event: ChangeEvent<HTMLInputElement>, type: "image" | "video") {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    const allowedTypes = type === "image" ? IMAGE_TYPES : VIDEO_TYPES
    const maxSize = type === "image" ? 20 * 1024 * 1024 : 500 * 1024 * 1024
    if (!allowedTypes.includes(file.type) || file.size > maxSize) {
      setMessage(type === "image"
        ? "Alege o imagine JPG, PNG, WebP, AVIF sau GIF de maximum 20 MB."
        : "Alege un video MP4, WebM, MOV sau OGG de maximum 500 MB.")
      return
    }

    setUploadType(type)
    setProgress(0)
    setMessage("")

    try {
      const safeName = file.name.normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .slice(-120) || "media-file"
      const blob = await upload(`portfolio/${kind}/${type}/${Date.now()}-${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/uploads",
        contentType: file.type,
        clientPayload: JSON.stringify({ kind: type, contentType: file.type }),
        multipart: type === "video",
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      })

      const savedMedia = await registerMedia({
        pathname: blob.pathname,
        url: blob.url,
        filename: file.name,
        contentType: file.type,
        byteSize: file.size,
      })

      if (!savedMedia) throw new Error("Media registration failed")
      setMedia((items) => [savedMedia, ...items.filter((item) => item.pathname !== savedMedia.pathname)])
      setMessage(type === "image" ? "Imagine încărcată în biblioteca media." : "Video încărcat în biblioteca media.")
      if (type === "video") onSelectVideo(savedMedia)
      if (type === "image") onInsertImage(savedMedia, imageAlt.trim() || readableFilename(file.name))
    } catch {
      setMessage("Încărcarea nu a reușit. Verifică conexiunea și încearcă din nou.")
    } finally {
      setUploadType(null)
      setProgress(0)
    }
  }

  const images = media.filter((item) => item.contentType.startsWith("image/"))
  const videos = media.filter((item) => item.contentType.startsWith("video/"))
  const supportsVideo = kind === "tutorial" || kind === "vlog"

  return (
    <section className="admin-media-library" aria-labelledby="media-library-title">
      <div className="admin-section-heading">
        <div><span className="admin-eyebrow">Vercel Blob</span><h2 id="media-library-title">Biblioteca media</h2></div>
        <span className="admin-section-count">{media.length} fișiere</span>
      </div>
      <p className="admin-media-intro">Încarcă fotografii pentru pagini și clipuri pentru tutoriale sau vloguri. Fișierele publicate sunt accesibile vizitatorilor site-ului.</p>
      <div className="admin-media-actions">
        <input ref={imageInput} className="admin-visually-hidden" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={(event) => handleUpload(event, "image")} aria-label="Alege o imagine pentru încărcare" />
        <input ref={videoInput} className="admin-visually-hidden" type="file" accept="video/mp4,video/webm,video/quicktime,video/ogg" onChange={(event) => handleUpload(event, "video")} aria-label="Alege un video pentru încărcare" />
        <button className="admin-media-upload-button" type="button" disabled={uploadType !== null} onClick={() => imageInput.current?.click()}><ImagePlus aria-hidden="true" />Încarcă imagine</button>
        {supportsVideo && <button className="admin-media-upload-button admin-media-video-button" type="button" disabled={uploadType !== null} onClick={() => videoInput.current?.click()}><Upload aria-hidden="true" />Încarcă video</button>}
      </div>
      {uploadType && <div className="admin-upload-progress" role="status"><LoaderCircle aria-hidden="true" />Se încarcă {uploadType === "image" ? "imaginea" : "videoul"}… <progress value={progress} max={100} aria-label={`Încărcare ${progress}%`} />{progress}%</div>}
      {message && <p className="admin-inline-status" role="status">{message}</p>}

      {images.length > 0 && (
        <div className="admin-media-group">
          <div className="admin-media-label-row"><h3>Fotografii</h3><label htmlFor="inline-image-alt">Text alternativ pentru imagine</label></div>
          <input id="inline-image-alt" className="admin-media-alt-input" value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} maxLength={240} placeholder="Descrie imaginea pentru cititoarele de ecran" />
          <div className="admin-media-grid">
            {images.map((item) => (
              <article className="admin-media-item" key={item.id}>
                <img src={item.url} alt="" loading="lazy" />
                <strong title={item.filename}>{item.filename}</strong>
                <div>
                  <button type="button" onClick={() => onInsertImage(item, imageAlt.trim() || readableFilename(item.filename))}>Inserează în text</button>
                  <button type="button" onClick={() => onSelectCover(item)}>Folosește ca copertă</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {supportsVideo && videos.length > 0 && (
        <div className="admin-media-group">
          <h3>Videoclipuri</h3>
          <div className="admin-media-grid admin-media-grid-videos">
            {videos.map((item) => (
              <article className="admin-media-item admin-media-item-video" key={item.id}>
                <span className="admin-media-video-icon" aria-hidden="true"><Play /></span>
                <strong title={item.filename}>{item.filename}</strong>
                <button type="button" onClick={() => onSelectVideo(item)}>Folosește video</button>
              </article>
            ))}
          </div>
        </div>
      )}
      {media.length === 0 && !uploadType && <p className="admin-media-empty">Biblioteca este goală. Încarcă prima imagine sau primul video.</p>}
    </section>
  )
}
