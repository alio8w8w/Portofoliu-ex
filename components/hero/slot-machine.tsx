"use client"

import { motion, useAnimationControls, useReducedMotion } from "framer-motion"
import { ArrowUpRight, Camera, Cherry, Code, Heart, ListChecks, Music, Play, Star } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { useLanguage } from "@/components/portfolio/language-context"
import type { HeroSlotData, SlotStatus } from "@/lib/content/types"

type SymbolId = "vlog" | "task" | "star" | "heart" | "camera" | "code" | "music" | "cherry" | "seven"
type Phase = "idle" | "spinning" | "result"

const FILLER: SymbolId[] = ["star", "heart", "camera", "code", "music", "cherry", "seven"]
const ALL_SYMBOLS: SymbolId[] = [...FILLER, "vlog", "task"]
const IDLE_SYMBOLS: SymbolId[] = ["seven", "cherry", "star"]

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

/** Where each reel must stop for a given status. */
function stopSymbolsFor(status: SlotStatus): SymbolId[] {
  if (status === "new vlog") return ["vlog", "vlog", "vlog"]
  if (status === "new tasks") return ["task", "task", "task"]

  // "nothing new": assorted filler symbols, never three of a kind.
  const first = pick(FILLER)
  const second = pick(FILLER)
  let third = pick(FILLER)
  while (first === second && second === third) third = pick(FILLER)
  return [first, second, third]
}

export function SlotMachine({ data }: { data: HeroSlotData }) {
  const { copy } = useLanguage()
  const reduceMotion = useReducedMotion()
  const leverControls = useAnimationControls()

  const [strips, setStrips] = useState<SymbolId[][]>(IDLE_SYMBOLS.map((symbol) => [symbol]))
  const [spinId, setSpinId] = useState(0)
  const [phase, setPhase] = useState<Phase>("idle")
  const phaseRef = useRef<Phase>("idle")

  const updatePhase = (next: Phase) => {
    phaseRef.current = next
    setPhase(next)
  }

  const spin = useCallback(() => {
    if (phaseRef.current === "spinning") return
    const stops = stopSymbolsFor(data.status)

    setStrips((previous) => previous.map((strip, reel) => {
      const showing = strip[strip.length - 1]
      const fillerCount = reduceMotion ? 2 : 14 + reel * 6
      return [showing, ...Array.from({ length: fillerCount }, () => pick(ALL_SYMBOLS)), stops[reel]]
    }))
    setSpinId((id) => id + 1)
    updatePhase("spinning")

    leverControls.start({
      rotateX: [0, 155, 0],
      transition: { duration: 0.75, times: [0, 0.35, 1], ease: ["easeIn", "backOut"] },
    })
  }, [data.status, leverControls, reduceMotion])

  // Give the machine one spin when the page opens so visitors see what's new.
  useEffect(() => {
    const timer = window.setTimeout(spin, 900)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onLastReelStopped = () => {
    if (spinId > 0 && phaseRef.current === "spinning") updatePhase("result")
  }

  const isWin = phase === "result" && data.status !== "nothing new"
  const spinning = phase === "spinning"

  return (
    <div className="slot-wrap relative mx-auto w-full max-w-[420px] pr-9 md:pr-11">
      <div className="slot-machine" data-phase={phase} data-win={isWin || undefined}>
        {/* Marquee */}
        <div className="slot-marquee">
          <div className="slot-bulbs" aria-hidden="true">
            {Array.from({ length: 11 }, (_, i) => <span key={i} style={{ animationDelay: `${i * 0.09}s` }} />)}
          </div>
          <p className="font-pixel slot-neon text-[clamp(10px,2.6vw,14px)]">{copy.slot.marquee}</p>
          <p className="font-pixel mt-1 text-[clamp(6px,1.5vw,8px)] tracking-[0.3em] text-white/80">{copy.slot.subtitle}</p>
        </div>

        {/* Chrome body + pink CRT screen */}
        <div className="slot-body">
          <div className="slot-screen">
            <div className="font-pixel flex justify-between text-[clamp(6px,1.4vw,8px)] text-[#7a2350]/80" aria-hidden="true">
              <span>PLAYER 1</span>
              <span>WORLD 1-1</span>
            </div>
            <div className="slot-reels" aria-hidden={spinning}>
              {strips.map((strip, reel) => (
                <div key={reel} className="slot-reel">
                  <motion.div
                    key={spinId}
                    className="flex flex-col"
                    initial={{ y: "0%" }}
                    animate={{
                      y: `${-((strip.length - 1) / strip.length) * 100}%`,
                      filter: spinId === 0 ? "blur(0px)" : ["blur(0px)", "blur(1.6px)", "blur(0px)"],
                    }}
                    transition={{
                      y: { duration: reduceMotion ? 0.35 : 1.3 + reel * 0.45, ease: [0.18, 0.62, 0.3, 1.06] },
                      filter: { duration: reduceMotion ? 0.35 : 1.3 + reel * 0.45, times: [0, 0.2, 1] },
                    }}
                    onAnimationComplete={reel === strips.length - 1 ? onLastReelStopped : undefined}
                  >
                    {strip.map((symbol, i) => (
                      <div key={i} className="slot-cell">
                        <SlotSymbol id={symbol} coverUrl={data.vlog?.coverUrl ?? null} />
                      </div>
                    ))}
                  </motion.div>
                </div>
              ))}
              <span className="slot-payline" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Control deck */}
        <div className="slot-deck">
          <div className="flex gap-[6%]" aria-hidden="true">
            {[0, 1, 2].map((i) => <span key={i} className="slot-arcade-btn slot-arcade-btn--blue" />)}
          </div>
          <motion.button
            type="button"
            onClick={spin}
            disabled={spinning}
            whileTap={{ y: 3, scale: 0.96 }}
            className="slot-spin-btn font-pixel"
          >
            {spinning ? copy.slot.spinning : copy.slot.spin}
          </motion.button>
          <div className="flex gap-[6%]" aria-hidden="true">
            {[0, 1, 2].map((i) => <span key={i} className="slot-arcade-btn slot-arcade-btn--red" />)}
          </div>
        </div>

        {/* Neon result panel */}
        <div className="slot-base" aria-live="polite">
          <SlotResult phase={phase} data={data} />
        </div>
      </div>

      {/* Mechanical lever */}
      <div className="slot-lever">
        <span className="slot-lever-housing" aria-hidden="true" />
        <motion.button
          type="button"
          aria-label={copy.slot.spin}
          onClick={spin}
          disabled={spinning}
          animate={leverControls}
          whileHover={spinning ? undefined : { rotateX: 18 }}
          style={{ transformOrigin: "50% 100%", transformPerspective: 500 }}
          className="slot-lever-arm"
        >
          <span className="slot-lever-ball" />
          <span className="slot-lever-rod" />
        </motion.button>
      </div>
    </div>
  )
}

function SlotResult({ phase, data }: { phase: Phase; data: HeroSlotData }) {
  const { copy } = useLanguage()

  if (phase !== "result") {
    return <p className="slot-neon-text font-pixel text-[clamp(9px,2.2vw,12px)]">{phase === "spinning" ? copy.slot.spinning : copy.slot.marquee}</p>
  }

  if (data.status === "new vlog" && data.vlog) {
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-1">
        <p className="slot-neon-text font-pixel text-[clamp(10px,2.6vw,14px)]">{copy.slot.newVlog}</p>
        <Link href={data.vlog.href} className="slot-result-link">
          {data.vlog.title} <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </motion.div>
    )
  }

  if (data.status === "new tasks") {
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-1">
        <p className="slot-neon-text font-pixel text-[clamp(10px,2.6vw,14px)]">{copy.slot.newTasks} ×{data.newTaskCount}</p>
        <Link href="/progress" className="slot-result-link">
          {copy.slot.tasksCta} <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-1">
      <p className="slot-neon-text font-pixel text-[clamp(9px,2.2vw,12px)]">{copy.slot.nothingNew}</p>
      <p className="text-[11px] text-white/80">{copy.slot.again}</p>
    </motion.div>
  )
}

function SlotSymbol({ id, coverUrl }: { id: SymbolId; coverUrl: string | null }) {
  switch (id) {
    case "vlog":
      return (
        <span className="slot-tile slot-tile--vlog">
          {coverUrl && <img src={coverUrl} alt="" className="absolute inset-0 size-full object-cover" />}
          <span className="relative grid size-[42%] place-items-center rounded-full bg-white/90 text-[#ec2b7a] shadow-md">
            <Play className="size-1/2 translate-x-[6%] fill-current" />
          </span>
          <span className="slot-tile-tag font-pixel">NEW VLOG</span>
        </span>
      )
    case "task":
      return (
        <span className="slot-tile slot-tile--task">
          <ListChecks className="size-[46%]" strokeWidth={2.4} />
          <span className="slot-tile-tag font-pixel">NEW TASK</span>
        </span>
      )
    case "seven":
      return <span className="font-pixel text-[clamp(28px,7vw,42px)] text-[#e0115f] [text-shadow:3px_3px_0_#ffd400]">7</span>
    case "star":
      return <Star className="size-[58%] fill-[#ffd400] text-[#b88a00]" strokeWidth={1.5} />
    case "heart":
      return <Heart className="size-[58%] fill-[#ec2b7a] text-[#a3164f]" strokeWidth={1.5} />
    case "cherry":
      return <Cherry className="size-[58%] text-[#e0115f]" strokeWidth={2.2} />
    case "camera":
      return <Camera className="size-[56%] text-[#4a1530]" strokeWidth={1.8} />
    case "code":
      return <Code className="size-[56%] text-[#a500ff]" strokeWidth={2.4} />
    case "music":
      return <Music className="size-[54%] text-[#00a8c0]" strokeWidth={2.2} />
  }
}
