"use client"

import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion"
import { ChevronDown, Clover } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { SlotMachine } from "@/components/hero/slot-machine"
import type { HeroSlotData } from "@/lib/content/types"
import { useLanguage } from "./language-context"

/* ------------------------------------------------------------------------------------------------
 * Hero "stage": a tall section with a sticky viewport. As you scroll, the camera moves in on the
 * slot machine until it fills the screen; then the lever pulls itself and the ticket prints.
 * Scrolling back up resets it, so the lever can be pulled again.
 * ---------------------------------------------------------------------------------------------- */

const ZOOM_END = 0.42 // fraction of the stage scroll at which the machine is fully close-up
const PULL_AT = 0.5 // the lever is pulled once you pass this point
const REARM_BELOW = 0.28 // scroll back above this to be able to pull again

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

type DecorKind = "dice" | "coin" | "star" | "heart" | "keycap" | "clover"
const DECOR: { kind: DecorKind; left: string; top: string; size: number; rotate: number; dx: number; dy: number; delay: number; mobile?: boolean }[] = [
  { kind: "dice", left: "13%", top: "24%", size: 118, rotate: -16, dx: -30, dy: -12, delay: 0, mobile: true },
  { kind: "coin", left: "80%", top: "20%", size: 92, rotate: 14, dx: 30, dy: -16, delay: 0.8, mobile: true },
  { kind: "star", left: "84%", top: "60%", size: 124, rotate: 10, dx: 34, dy: 8, delay: 1.6 },
  { kind: "heart", left: "9%", top: "62%", size: 104, rotate: -10, dx: -34, dy: 10, delay: 0.4 },
  { kind: "keycap", left: "22%", top: "82%", size: 86, rotate: 12, dx: -22, dy: 22, delay: 1.2, mobile: true },
  { kind: "clover", left: "72%", top: "84%", size: 70, rotate: -14, dx: 24, dy: 24, delay: 2 },
]

export function HeroSection({ slot }: { slot: HeroSlotData }) {
  const { copy } = useLanguage()
  const reduceMotion = useReducedMotion() ?? false
  const stageRef = useRef<HTMLElement>(null)
  const machineRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start start", "end end"] })

  // How big the machine is far away / close up, measured against the viewport.
  const fitFrom = useMotionValue(0.5)
  const fitTo = useMotionValue(1)
  useEffect(() => {
    const measure = () => {
      const el = machineRef.current
      if (!el) return
      const to = Math.min((0.92 * window.innerHeight) / el.offsetHeight, (0.94 * window.innerWidth) / el.offsetWidth)
      fitTo.set(to)
      fitFrom.set(to * 0.52)
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [fitFrom, fitTo])

  const zoom = useTransform(scrollYProgress, [0, ZOOM_END], [0, 1], { clamp: true })
  const scale = useTransform([zoom, fitFrom, fitTo] as MotionValue<number>[], ([z, from, to]: number[]) =>
    reduceMotion ? to : from + (to - from) * easeInOut(z))
  const machineY = useTransform(zoom, [0, 1], ["7vh", "0vh"])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0])
  const titleY = useTransform(scrollYProgress, [0, 0.3], ["0vh", "-14vh"])
  const titleScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.25])
  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0])

  // Pull the lever once the camera has arrived; re-arm when scrolling back up.
  const [pullSignal, setPullSignal] = useState(0)
  const armed = useRef(true)
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (p > PULL_AT && armed.current) {
      armed.current = false
      setPullSignal((n) => n + 1)
    }
    if (p < REARM_BELOW) armed.current = true
  })

  return (
    <>
      <section ref={stageRef} className="hero-stage" id="home" aria-labelledby="hero-title">
        <h1 id="hero-title" className="sr-only">{copy.hero.title}</h1>
        <div className="hero-stage-sticky">
          {/* arched chrome title, like the "MORE WINNING" reference */}
          <motion.div className="hero-arch" style={{ opacity: titleOpacity, y: titleY, scale: titleScale }} aria-hidden="true">
            <svg viewBox="0 0 1000 300">
              <defs>
                <linearGradient id="hero-chrome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="0.42" stopColor="#d4d2de" />
                  <stop offset="0.52" stopColor="#6f6a80" />
                  <stop offset="0.62" stopColor="#f6f4fb" />
                  <stop offset="1" stopColor="#a29db3" />
                </linearGradient>
                <path id="hero-arc" d="M 90 290 Q 500 -70 910 290" fill="none" />
              </defs>
              <text className="hero-arch-text" fill="url(#hero-chrome)">
                <textPath href="#hero-arc" startOffset="50%" textAnchor="middle">{copy.slot.stageTitle}</textPath>
              </text>
            </svg>
          </motion.div>

          {DECOR.map((item) => <DecorItem key={item.kind} item={item} zoom={zoom} reduceMotion={reduceMotion} />)}

          <motion.div ref={machineRef} className="hero-stage-machine" style={{ scale, y: machineY }}>
            <SlotMachine data={slot} pullSignal={pullSignal} />
          </motion.div>

          <motion.p className="hero-scroll-hint" style={{ opacity: hintOpacity }} aria-hidden="true">
            {copy.slot.scrollHint}
            <ChevronDown />
          </motion.p>
        </div>
      </section>
      <div className="hero-bottom page-width" aria-hidden="true">
        <span>DESIGN WITH FEELING</span><span className="hero-bottom-star">✳</span><span>BUILD WITH CARE</span><span className="hero-bottom-star">✳</span><span>STAY CURIOUS</span>
      </div>
    </>
  )
}

/** A glossy 3D-looking object floating around the machine; it drifts out of frame as the camera moves in. */
function DecorItem({ item, zoom, reduceMotion }: { item: (typeof DECOR)[number]; zoom: MotionValue<number>; reduceMotion: boolean }) {
  const x = useTransform(zoom, [0, 1], ["0vw", `${item.dx}vw`])
  const y = useTransform(zoom, [0, 1], ["0vh", `${item.dy}vh`])
  const opacity = useTransform(zoom, [0, 0.8], [1, 0])
  const scale = useTransform(zoom, [0, 1], [1, 1.5])

  return (
    <motion.div
      aria-hidden="true"
      className={`hero-decor ${item.mobile ? "" : "max-md:hidden"}`}
      style={{ left: item.left, top: item.top, width: item.size, height: item.size, x, y, opacity, scale }}
    >
      <div className="hero-decor-float" style={{ rotate: `${item.rotate}deg`, animationDelay: `${item.delay}s`, animationPlayState: reduceMotion ? "paused" : undefined }}>
        <DecorShape kind={item.kind} />
      </div>
    </motion.div>
  )
}

function DecorShape({ kind }: { kind: DecorKind }) {
  switch (kind) {
    case "dice":
      return (
        <span className="decor-dice">
          {[0, 1, 2, 3, 4].map((i) => <i key={i} />)}
        </span>
      )
    case "coin":
      return <span className="decor-coin"><span>LZ</span></span>
    case "keycap":
      return <span className="decor-keycap"><span>LUCK</span></span>
    case "star":
      return (
        <svg viewBox="0 0 100 100" className="decor-svg decor-star">
          <defs>
            <linearGradient id="decor-chrome" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.35" stopColor="#b9b6c8" />
              <stop offset="0.5" stopColor="#5e5a70" />
              <stop offset="0.65" stopColor="#f3f1fa" />
              <stop offset="1" stopColor="#8d89a0" />
            </linearGradient>
          </defs>
          <path d="M50 4 L61 37 L96 38 L68 59 L78 94 L50 73 L22 94 L32 59 L4 38 L39 37 Z" fill="url(#decor-chrome)" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )
    case "heart":
      return (
        <svg viewBox="0 0 100 92" className="decor-svg decor-heart">
          <defs>
            <radialGradient id="decor-jelly" cx="0.35" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#c9b2ff" />
              <stop offset="0.45" stopColor="#7b46f8" />
              <stop offset="1" stopColor="#3a1599" />
            </radialGradient>
          </defs>
          <path d="M50 88 C20 66 4 50 4 28 C4 14 15 4 28 4 C38 4 45 9 50 17 C55 9 62 4 72 4 C85 4 96 14 96 28 C96 50 80 66 50 88 Z" fill="url(#decor-jelly)" />
          <ellipse cx="28" cy="24" rx="12" ry="7" fill="#fff" opacity="0.55" transform="rotate(-30 28 24)" />
        </svg>
      )
    case "clover":
      return <span className="decor-clover"><Clover /></span>
  }
}
