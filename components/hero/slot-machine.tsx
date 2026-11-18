"use client"

import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion"
import {
  ArrowUpRight, Camera, Cherry, Clover, CloudRain, Code, Dumbbell, Gem, GitBranch, Heart, Languages, Newspaper, Palette, Star,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { useLanguage } from "@/components/portfolio/language-context"
import { CONTENT_META, type HeroSlotData } from "@/lib/content/types"

/* ------------------------------------------------------------------------------------------------
 * A big, realistic pink slot machine with three game modes, switched with the keys on its deck:
 *  - News:  three "post" symbols + a ticket linking to the post, if something was published in
 *           the last 24 hours; otherwise mixed symbols and a "nothing new" ticket.
 *  - Skill: picks today's skill to train (English, GitHub, full-stack, sport, design).
 *  - Luck:  a lucky day (more likely) or not; prints congratulations or a motivational note.
 * The result is printed on a paper ticket that slides out of the slot under the reels.
 * ---------------------------------------------------------------------------------------------- */

type Mode = "news" | "skill" | "luck"
type Skill = "english" | "github" | "fullstack" | "sport" | "design"
type SymbolId = "post" | Skill | "clover" | "seven" | "star" | "heart" | "cherry" | "gem" | "camera" | "rain"

type Ticket =
  | { kind: "post" }
  | { kind: "noNews" }
  | { kind: "skill"; skill: Skill }
  | { kind: "lucky" }
  | { kind: "unlucky"; quote: number }

const MODES: Mode[] = ["news", "skill", "luck"]
const SKILLS: Skill[] = ["english", "github", "fullstack", "sport", "design"]
const LUCKY_CHANCE = 0.72
const QUOTE_COUNT = 5

const SYMBOLS: Record<SymbolId, { icon?: LucideIcon; color: string; fill?: boolean; tag?: string }> = {
  post: { icon: Newspaper, color: "#7b46f8", tag: "NEW" },
  english: { icon: Languages, color: "#7b46f8" },
  github: { icon: GitBranch, color: "#2e2530" },
  fullstack: { icon: Code, color: "#ff4f9e" },
  sport: { icon: Dumbbell, color: "#fe8616" },
  design: { icon: Palette, color: "#e0115f" },
  clover: { icon: Clover, color: "#3faa4d", fill: true },
  seven: { color: "#e0115f" },
  star: { icon: Star, color: "#f2b200", fill: true },
  heart: { icon: Heart, color: "#ff4f9e", fill: true },
  cherry: { icon: Cherry, color: "#e0115f" },
  gem: { icon: Gem, color: "#7b46f8" },
  camera: { icon: Camera, color: "#2e2530" },
  rain: { icon: CloudRain, color: "#6f7fa8" },
}

const NEWS_FILLER: SymbolId[] = ["star", "heart", "cherry", "seven", "gem", "camera"]
const LUCK_FILLER: SymbolId[] = ["rain", "star", "heart", "seven", "cherry", "gem"]
const STRIP_FILLER: SymbolId[] = ["star", "heart", "cherry", "seven", "gem", "camera", "clover", "post", "english", "sport"]

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

/** Three symbols that are NOT all the same. */
function mixed(pool: SymbolId[]): SymbolId[] {
  const a = pick(pool), b = pick(pool)
  let c = pick(pool)
  while (a === b && b === c) c = pick(pool)
  return [a, b, c]
}

function decide(mode: Mode, hasNews: boolean): { stops: SymbolId[]; ticket: Ticket; win: boolean } {
  if (mode === "news") {
    return hasNews
      ? { stops: ["post", "post", "post"], ticket: { kind: "post" }, win: true }
      : { stops: mixed(NEWS_FILLER), ticket: { kind: "noNews" }, win: false }
  }
  if (mode === "skill") {
    const skill = pick(SKILLS)
    return { stops: [skill, skill, skill], ticket: { kind: "skill", skill }, win: true }
  }
  return Math.random() < LUCKY_CHANCE
    ? { stops: ["clover", "clover", "clover"], ticket: { kind: "lucky" }, win: true }
    : { stops: mixed(LUCK_FILLER), ticket: { kind: "unlucky", quote: Math.floor(Math.random() * QUOTE_COUNT) }, win: false }
}

const IDLE: SymbolId[] = ["seven", "clover", "heart"]

export function SlotMachine({ data }: { data: HeroSlotData }) {
  const { copy, locale } = useLanguage()
  const t = copy.slot
  const reduceMotion = useReducedMotion() ?? false
  const lever = useAnimationControls()

  const [mode, setMode] = useState<Mode>("news")
  const [strips, setStrips] = useState<SymbolId[][]>(IDLE.map((s) => [s]))
  const [spinId, setSpinId] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ ticket: Ticket; win: boolean; number: number } | null>(null)
  const pending = useRef<{ ticket: Ticket; win: boolean } | null>(null)
  const spinningRef = useRef(false)

  const spin = useCallback((forMode: Mode = mode) => {
    if (spinningRef.current) return
    spinningRef.current = true
    setSpinning(true)
    setResult(null)

    const outcome = decide(forMode, Boolean(data.latestPost))
    pending.current = outcome
    setStrips((previous) => previous.map((strip, reel) => {
      const showing = strip[strip.length - 1]
      const filler = reduceMotion ? 2 : 16 + reel * 6
      return [showing, ...Array.from({ length: filler }, () => pick(STRIP_FILLER)), outcome.stops[reel]]
    }))
    setSpinId((id) => id + 1)
    lever.start({ rotateX: [0, 150, 0], transition: { duration: 0.8, times: [0, 0.35, 1], ease: ["easeIn", "backOut"] } })
  }, [data.latestPost, lever, mode, reduceMotion])

  // First visit: spin once in News mode so the machine greets you with a ticket.
  useEffect(() => {
    const timer = window.setTimeout(() => spin("news"), 900)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onReelsStopped = () => {
    if (!spinningRef.current || !pending.current) return
    spinningRef.current = false
    setSpinning(false)
    setResult({ ...pending.current, number: 1000 + Math.floor(Math.random() * 9000) })
  }

  const chooseMode = (next: Mode) => {
    if (spinningRef.current || next === mode) return
    setMode(next)
    setResult(null)
  }

  const win = Boolean(result?.win)

  return (
    <div className="sm-wrap">
      <div className="sm-cabinet" data-spinning={spinning || undefined} data-win={win || undefined}>
        {/* ---- crown: lamps + marquee ---- */}
        <div className="sm-crown" aria-hidden="true">
          <span className="sm-lamp" />
          <span className="sm-crown-divider" />
          <span className="sm-lamp" />
        </div>
        <div className="sm-marquee">
          <div className="sm-hearts" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => <Heart key={i} className="sm-heart" style={{ animationDelay: `${i * 0.12}s` }} />)}
          </div>
          <p className="sm-title" aria-live="polite">{spinning ? t.spinning : t.titles[mode]}</p>
        </div>

        {/* ---- reel window ---- */}
        <div className="sm-window">
          <div className="sm-bezel">
            <div className="sm-reels" aria-hidden="true">
              {strips.map((strip, reel) => (
                <div key={reel} className="sm-reel">
                  <motion.div
                    key={spinId}
                    className="flex flex-col"
                    initial={{ y: "0%" }}
                    animate={{ y: `${-((strip.length - 1) / strip.length) * 100}%` }}
                    transition={{ duration: reduceMotion ? 0.35 : 1.35 + reel * 0.45, ease: [0.16, 0.6, 0.3, 1.04] }}
                    onAnimationComplete={reel === strips.length - 1 && spinId > 0 ? onReelsStopped : undefined}
                  >
                    {strip.map((symbol, i) => <div key={i} className="sm-cell"><Symbol id={symbol} /></div>)}
                  </motion.div>
                </div>
              ))}
              <span className="sm-payline" />
            </div>
            <span className="sm-glass" aria-hidden="true" />
          </div>
        </div>

        {/* ---- deck: mode keys + spin ---- */}
        <div className="sm-deck">
          <div className="sm-keys" role="group" aria-label={t.modeGroup}>
            {MODES.map((m) => (
              <motion.button
                key={m}
                type="button"
                className="sm-key"
                aria-pressed={mode === m}
                disabled={spinning}
                onClick={() => chooseMode(m)}
                whileTap={{ y: 3 }}
              >
                {t.modes[m]}
              </motion.button>
            ))}
          </div>
          <motion.button type="button" className="sm-spin" onClick={() => spin()} disabled={spinning} whileTap={{ scale: 0.92 }}>
            {t.spin}
          </motion.button>
        </div>

        {/* ---- ticket slot ---- */}
        <div className="sm-slot" aria-hidden="true" />
        <div className="sm-ticket-track" aria-live="polite">
          <AnimatePresence>
            {result && (
              <motion.div
                key={spinId}
                className="sm-ticket"
                initial={{ y: "-104%" }}
                animate={{ y: "0%", transition: { duration: reduceMotion ? 0.2 : 0.9, ease: [0.3, 0.9, 0.3, 1] } }}
                exit={{ y: "-104%", transition: { duration: 0.3, ease: "easeIn" } }}
              >
                <TicketBody ticket={result.ticket} number={result.number} data={data} locale={locale} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---- lower door ---- */}
        <div className="sm-door" aria-hidden="true">
          <span className="sm-badge">LZ</span>
        </div>
      </div>

      {/* ---- lever ---- */}
      <div className="sm-lever">
        <span className="sm-lever-housing" aria-hidden="true" />
        <motion.button
          type="button"
          aria-label={t.pull}
          title={t.pull}
          onClick={() => spin()}
          disabled={spinning}
          animate={lever}
          whileHover={spinning ? undefined : { rotateX: 16 }}
          style={{ transformOrigin: "50% 100%", transformPerspective: 500 }}
          className="sm-lever-arm"
        >
          <span className="sm-lever-ball" />
          <span className="sm-lever-rod" />
        </motion.button>
      </div>
    </div>
  )
}

function Symbol({ id }: { id: SymbolId }) {
  const symbol = SYMBOLS[id]
  if (id === "seven") return <span className="sm-seven">7</span>
  const Icon = symbol.icon!
  return (
    <span className="relative grid size-full place-items-center">
      <Icon className="size-[52%]" style={{ color: symbol.color, fill: symbol.fill ? symbol.color : "none" }} strokeWidth={1.8} />
      {symbol.tag && <span className="sm-symbol-tag">{symbol.tag}</span>}
    </span>
  )
}

function TicketBody({ ticket, number, data, locale }: { ticket: Ticket; number: number; data: HeroSlotData; locale: string }) {
  const { copy } = useLanguage()
  const t = copy.slot
  const date = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(new Date())

  let body
  switch (ticket.kind) {
    case "post":
      body = (
        <>
          <p className="sm-ticket-head">{t.newPost}</p>
          {data.latestPost && (
            <>
              <p className="sm-ticket-kind">{CONTENT_META[data.latestPost.kind].title}</p>
              <p className="sm-ticket-main">{data.latestPost.title}</p>
              <Link href={data.latestPost.href} className="sm-ticket-link">{t.read} <ArrowUpRight aria-hidden="true" /></Link>
            </>
          )}
        </>
      )
      break
    case "noNews":
      body = (
        <>
          <p className="sm-ticket-main">{t.noNews}</p>
          <p className="sm-ticket-note">{t.noNewsHint}</p>
        </>
      )
      break
    case "skill":
      body = (
        <>
          <p className="sm-ticket-head">{t.skillTitle}</p>
          <p className="sm-ticket-big">{t.skills[ticket.skill]}</p>
          <p className="sm-ticket-note">{t.skillHint}</p>
        </>
      )
      break
    case "lucky":
      body = (
        <>
          <p className="sm-ticket-head">{t.luckyTitle}</p>
          <p className="sm-ticket-big">☘ ☘ ☘</p>
          <p className="sm-ticket-main">{t.luckyText}</p>
        </>
      )
      break
    case "unlucky":
      body = (
        <>
          <p className="sm-ticket-head">{t.unluckyTitle}</p>
          <p className="sm-ticket-note">{t.unluckyLead}</p>
          <p className="sm-ticket-main">“{t.quotes[ticket.quote]}”</p>
        </>
      )
      break
  }

  return (
    <>
      <div className="sm-ticket-meta"><span>LIZARD · {t.ticketLabel} #{number}</span><span>{date}</span></div>
      <div className="sm-ticket-body">{body}</div>
      <div className="sm-ticket-barcode" aria-hidden="true" />
    </>
  )
}
