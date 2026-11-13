"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Disc3, Pause, Play, SkipBack, SkipForward } from "lucide-react"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { playlistFolderForPath, tracksForFolder, type Track } from "@/lib/audio/playlists"
import { useLanguage } from "@/components/portfolio/language-context"

const VOLUME = 0.8
const CROSSFADE_MS = 900

/**
 * Fixed audio player. It lives in the root layout, so it survives client-side navigation.
 * Two <audio> "decks" let it crossfade when the route's playlist folder changes.
 */
export function AudioPlayer() {
  const { copy } = useLanguage()
  const pathname = usePathname()
  const folder = playlistFolderForPath(pathname)
  const tracks = useMemo(() => tracksForFolder(folder), [folder])

  const decks = useRef<(HTMLAudioElement | null)[]>([null, null])
  const activeDeck = useRef(0)
  const fadeFrame = useRef<number | null>(null)
  const playingRef = useRef(false)
  const tracksRef = useRef<Track[]>(tracks)
  const indexRef = useRef(0)
  const mounted = useRef(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const [index, setIndex] = useState(0)

  const setPlaying = (value: boolean) => {
    playingRef.current = value
    setIsPlaying(value)
  }

  const cancelFade = () => {
    if (fadeFrame.current !== null) cancelAnimationFrame(fadeFrame.current)
    fadeFrame.current = null
  }

  const crossfade = useCallback((outgoing: HTMLAudioElement | null, incoming: HTMLAudioElement | null) => {
    cancelFade()
    const start = performance.now()
    const outgoingStart = outgoing?.volume ?? 0

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / CROSSFADE_MS)
      const eased = t * t * (3 - 2 * t)
      if (incoming) incoming.volume = VOLUME * eased
      if (outgoing) outgoing.volume = outgoingStart * (1 - eased)

      if (t < 1) {
        fadeFrame.current = requestAnimationFrame(step)
      } else {
        fadeFrame.current = null
        outgoing?.pause()
      }
    }
    fadeFrame.current = requestAnimationFrame(step)
  }, [])

  /** Point the player at `list[nextIndex]`, crossfading if music is already playing. */
  const switchTo = useCallback((list: Track[], nextIndex: number) => {
    tracksRef.current = list
    indexRef.current = nextIndex
    setIndex(nextIndex)

    const current = decks.current[activeDeck.current]
    const track = list[nextIndex]
    if (!current) return

    if (!track) {
      // New page has no music: fade out and stop.
      if (playingRef.current) crossfade(current, null)
      setPlaying(false)
      return
    }

    if (!playingRef.current) {
      cancelFade()
      current.src = track.src
      current.volume = VOLUME
      return
    }

    const nextDeckIndex = 1 - activeDeck.current
    const next = decks.current[nextDeckIndex]
    if (!next) return

    next.src = track.src
    next.volume = 0
    activeDeck.current = nextDeckIndex
    next.play().catch(() => setPlaying(false))
    crossfade(current, next)
  }, [crossfade])

  // Swap playlists when the route maps to a different folder.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      tracksRef.current = tracks
      const deck = decks.current[activeDeck.current]
      if (deck && tracks[0]) deck.src = tracks[0].src
      return
    }
    switchTo(tracks, 0)
  }, [tracks, switchTo])

  useEffect(() => () => {
    cancelFade()
    decks.current.forEach((deck) => deck?.pause())
  }, [])

  const togglePlay = () => {
    const deck = decks.current[activeDeck.current]
    const track = tracksRef.current[indexRef.current]
    if (!deck || !track) return

    if (playingRef.current) {
      cancelFade()
      decks.current.forEach((d) => d?.pause())
      setPlaying(false)
      return
    }

    if (!deck.getAttribute("src")) deck.src = track.src
    deck.volume = VOLUME
    deck.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }

  const skip = (direction: 1 | -1) => {
    const list = tracksRef.current
    if (list.length === 0) return
    switchTo(list, (indexRef.current + direction + list.length) % list.length)
  }

  const onEnded = (event: React.SyntheticEvent<HTMLAudioElement>) => {
    if (event.currentTarget === decks.current[activeDeck.current]) skip(1)
  }

  const track = tracks[index]

  return (
    <>
      <audio ref={(el) => { decks.current[0] = el }} preload="none" onEnded={onEnded} />
      <audio ref={(el) => { decks.current[1] = el }} preload="none" onEnded={onEnded} />

      <AnimatePresence>
        {track && (
          <motion.div
            key="player"
            role="region"
            aria-label={copy.player.label}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="audio-player fixed bottom-4 left-1/2 z-50 flex w-[min(360px,calc(100%-32px))] -translate-x-1/2 items-center gap-3 rounded-full py-2 pr-2 pl-2.5 md:right-6 md:bottom-6 md:left-auto md:translate-x-0"
          >
            <motion.span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-[conic-gradient(from_200deg,#a500ff,#ec2b7a,#ffff00,#ceff32,#00ffff,#a500ff)] text-white shadow-[inset_0_0_0_3px_rgb(255_255_255/55%)]"
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={isPlaying ? { repeat: Infinity, duration: 3.2, ease: "linear" } : { duration: 0.4 }}
            >
              <Disc3 className="size-5" />
            </motion.span>

            <div className="min-w-0 flex-1 leading-tight">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={track.src}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="truncate text-[13px] font-semibold text-[#40202a]"
                  title={track.title}
                >
                  {track.title}
                </motion.p>
              </AnimatePresence>
              <p className="font-pixel text-[8px] tracking-wider text-[#a3246a] uppercase">
                {folder} · {index + 1}/{tracks.length}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <PlayerButton label={copy.player.previous} onClick={() => skip(-1)} disabled={tracks.length < 2}>
                <SkipBack className="size-4" />
              </PlayerButton>
              <PlayerButton label={isPlaying ? copy.player.pause : copy.player.play} onClick={togglePlay} primary>
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
              </PlayerButton>
              <PlayerButton label={copy.player.next} onClick={() => skip(1)} disabled={tracks.length < 2}>
                <SkipForward className="size-4" />
              </PlayerButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function PlayerButton({ label, onClick, disabled, primary, children }: {
  label: string
  onClick: () => void
  disabled?: boolean
  primary?: boolean
  children: React.ReactNode
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.88, y: 1 }}
      className={
        primary
          ? "grid size-10 place-items-center rounded-full bg-[#ec2b7a] text-white shadow-[0_4px_0_#a3164f,0_8px_18px_rgb(236_43_122/45%)] active:translate-y-0.5 active:shadow-[0_2px_0_#a3164f]"
          : "grid size-8 place-items-center rounded-full text-[#40202a] transition-colors hover:bg-white/60 disabled:opacity-35"
      }
    >
      {children}
    </motion.button>
  )
}
