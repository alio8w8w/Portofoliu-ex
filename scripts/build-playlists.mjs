// Scans public/mus*/ for audio files and writes lib/audio/playlists.generated.json.
// Runs automatically before `dev` and `build`; run `npm run playlists` after adding tracks.
import { readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs"
import { join, extname, basename, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const publicDir = join(root, "public")
const outFile = join(root, "lib", "audio", "playlists.generated.json")
const audioExtensions = new Set([".mp3", ".m4a", ".aac", ".ogg", ".oga", ".opus", ".wav", ".flac", ".webm"])

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })

function titleFromFilename(filename) {
  return basename(filename, extname(filename))
    .replace(/^\d+[\s._-]+/, "")
    .replace(/[_-]+/g, " ")
    .trim()
}

const playlists = {}
for (const entry of readdirSync(publicDir).sort(collator.compare)) {
  const folderPath = join(publicDir, entry)
  if (!/^mus\d+$/i.test(entry) || !statSync(folderPath).isDirectory()) continue

  playlists[entry] = readdirSync(folderPath)
    .filter((file) => audioExtensions.has(extname(file).toLowerCase()))
    .sort(collator.compare)
    .map((file) => ({
      src: `/${encodeURIComponent(entry)}/${encodeURIComponent(file)}`,
      title: titleFromFilename(file) || file,
    }))
}

mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, `${JSON.stringify(playlists, null, 2)}\n`)

const summary = Object.entries(playlists).map(([folder, tracks]) => `${folder}: ${tracks.length}`).join(", ")
console.log(`[playlists] ${summary || "no public/mus* folders found"}`)
