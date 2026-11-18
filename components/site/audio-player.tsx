"use client"

import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform } from "framer-motion"
import { Pause, Play, SkipBack, SkipForward } from "lucide-react"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { playlistFolderForPath, tracksForFolder, type Track } from "@/lib/audio/playlists"
import { useLanguage } from "@/components/portfolio/language-context"

const VOLUME = 0.8
const CROSSFADE_MS = 900
/** Disc speed while playing, in degrees per millisecond (~33 rpm feel). */
const SPIN_SPEED = 0.2

/**
 * Fixed audio player: a spinning vinyl disc that pulses with the music. Hover (or tap on touch
 * screens) unfolds a small panel with the track name, play/pause and previous/next.
 * It lives in the root layout, so it survives client-side navigation; two <audio> "decks" let it
 * crossfade when the route's playlist folder changes.
 */
export function AudioPlayer() {
  const { copy } = useLanguage()
  const pathname = usePathname()
  const reduceMotion = useReducedMotion() ?? false
  const folder = playlistFolderForPath(pathname)
  const tracks = useMemo(() => tracksForFolder(folder), [folder])

  const decks = useRef<(HTMLAudioElement | null)[]>([null, null])
  const activeDeck = useRef(0)
  const fadeFrame = useRef<number | null>(null)
  const playingRef = useRef(false)
  const tracksRef = useRef<Track[]>(tracks)
  const indexRef = useRef(0)
  const mounted = useRef(false)

  // Web Audio analyser: created on the first play (browsers require a user gesture).
  const audioCtx = useRef<AudioContext | null>(null)
  const analysers = useRef<(AnalyserNode | null)[]>([null, null])
  const freqData = useRef<Uint8Array<ArrayBuffer> | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const pointerType = useRef<string>("mouse")

  // disc rotation + beat level, updated every frame
  const rotation = useMotionValue(0)
  const level = useMotionValue(0)
  const discScale = useTransform(level, (l) => 1 + l * 0.14)
  const haloOpacity = useTransform(level, (l) => 0.25 + l * 0.75)
  const haloScale = useTransform(level, (l) => 1 + l * 0.35)

  const setPlaying = (value: boolean) => {
    playingRef.current = value
    setIsPlaying(value)
  }

  const ensureAnalysers = () => {
    if (typeof window === "undefined" || !("AudioContext" in window)) return
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext()
      const ctx = audioCtx.current
      decks.current.forEach((deck, i) => {
        if (!deck || analysers.current[i]) return
        const source = ctx.createMediaElementSource(deck)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.75
        source.connect(analyser)
        analyser.connect(ctx.destination)
        analysers.current[i] = analyser
      })
      if (!freqData.current) freqData.current = new Uint8Array(new ArrayBuffer(128))
      if (ctx.state === "suspended") void ctx.resume()
    } catch {
      // No analyser (e.g. unsupported browser): the disc simply spins without pulsing.
    }
  }

  useAnimationFrame((_, delta) => {
    if (!playingRef.current) {
      level.set(level.get() * 0.9)
      return
    }
    if (!reduceMotion) rotation.set((rotation.get() + delta * SPIN_SPEED) % 360)

    const analyser = analysers.current[activeDeck.current]
    const data = freqData.current
    if (!analyser || !data || reduceMotion) return
    analyser.getByteFrequencyData(data)
    // bass energy (lowest bins) drives the pulse
    let sum = 0
    for (let i = 1; i < 10; i++) sum += data[i]
    const bass = Math.min(1, Math.max(0, (sum / 9 - 90) / 140))
    level.set(level.get() * 0.7 + bass * 0.3)
  })

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
    void audioCtx.current?.close()
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

    ensureAnalysers()
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

  // Mouse: the disc plays/pauses (the panel opens on hover). Touch: tapping the disc opens the panel.
  const onDiscClick = () => {
    if (pointerType.current === "touch" && !open) setOpen(true)
    else togglePlay()
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
            className="audio-dock fixed right-5 bottom-5 z-50 flex items-center md:right-7 md:bottom-7"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false) }}
          >
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="panel"
                  className="audio-panel"
                  initial={{ opacity: 0, width: 0, x: 16 }}
                  animate={{ opacity: 1, width: "auto", x: 0 }}
                  exit={{ opacity: 0, width: 0, x: 16 }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                >
                  <div className="audio-panel-inner">
                    <div className="min-w-0 flex-1 leading-tight">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.p
                          key={track.src}
                          initial={{ y: 6, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -6, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="audio-title"
                          title={track.title}
                        >
                          {track.title}
                        </motion.p>
                      </AnimatePresence>
                      <p className="audio-meta">{index + 1} / {tracks.length}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* the disc: spins while playing and pulses with the bass */}
            <button
              type="button"
              className="audio-disc-button"
              aria-label={isPlaying ? copy.player.pause : copy.player.play}
              aria-pressed={isPlaying}
              onPointerDown={(event) => { pointerType.current = event.pointerType }}
              onClick={onDiscClick}
            >
              <motion.span aria-hidden="true" className="audio-halo" style={{ opacity: haloOpacity, scale: haloScale }} data-playing={isPlaying || undefined} />
              <motion.span aria-hidden="true" className="audio-disc" style={{ rotate: rotation, scale: discScale }}>
                <span className="audio-disc-label" />
              </motion.span>
            </button>
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
      whileTap={{ scale: 0.88 }}
      className={primary ? "audio-btn audio-btn--primary" : "audio-btn"}
    >
      {children}
    </motion.button>
  )
}
