import generated from "./playlists.generated.json"

export type Track = { src: string; title: string }

/**
 * Which public/ folder plays on which route. First match wins.
 * `exact: true` matches only that path; otherwise the path and everything under it.
 * Add a folder (e.g. public/mus3/) and a line here to give a page its own playlist.
 */
export const PLAYLIST_ROUTES: { path: string; folder: string; exact?: boolean }[] = [
  { path: "/", folder: "mus1", exact: true },
]

/** Folder used by every route not listed above. */
export const DEFAULT_PLAYLIST_FOLDER = "mus2"

const playlists = generated as Record<string, Track[]>

export function playlistFolderForPath(pathname: string) {
  const match = PLAYLIST_ROUTES.find(({ path, exact }) =>
    exact ? pathname === path : pathname === path || pathname.startsWith(`${path}/`),
  )
  return match?.folder ?? DEFAULT_PLAYLIST_FOLDER
}

export function tracksForFolder(folder: string): Track[] {
  return playlists[folder] ?? []
}
