"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type CSSProperties, type ReactNode } from "react"
import { useLanguage, type Locale } from "@/components/portfolio/language-context"

const locales: Locale[] = ["en", "ro", "ru"]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Original wordmark: rhinestone script "Ilina" over a wide-tracked serif "Boclincă". */
function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex flex-col items-center leading-none">
      <span className={`rhinestone-text font-script leading-[1.1] ${compact ? "text-[32px]" : "text-[34px]"}`}>Ilina</span>
      {!compact && (
        <span className="font-serif-display text-[8px] tracking-[0.42em] text-[#5a2232] uppercase">Boclincă</span>
      )}
    </span>
  )
}

const spring = { type: "spring", stiffness: 380, damping: 24 } as const

/* ---------- Decorations from the reference: star sticker, paper clip, binder clip ---------- */

function StarSticker({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 40 40" className={className}>
      <path
        d="M20 3.5l4.6 10 10.9 1.2-8.1 7.4 2.3 10.8L20 27.4l-9.7 5.5 2.3-10.8-8.1-7.4 10.9-1.2z"
        fill="#dc5a78" stroke="#fde3e9" strokeWidth="2.4" strokeLinejoin="round"
      />
      <path d="M20 9.5l2.7 5.9 6.4.7-4.8 4.3 1.4 6.3L20 23.5l-5.7 3.2 1.4-6.3-4.8-4.3 6.4-.7z" fill="#ec8199" />
    </svg>
  )
}

function PaperClip({ className = "" }: { className?: string }) {
  const d = "M15 14V43a5 5 0 0 1-10 0V9a7 7 0 0 1 14 0v38a9 9 0 0 1-18 0V18"
  return (
    <svg aria-hidden="true" width="22" height="58" viewBox="0 0 22 58" className={className}>
      <path d={d} fill="none" stroke="#c97789" strokeWidth="1" strokeLinecap="round" transform="translate(0.8 0.8)" opacity="0.55" />
      <path d={d} fill="none" stroke="#f3bcc7" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

function BinderClip({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="34" height="46" viewBox="0 0 34 46" className={className}>
      {/* silver wire handles */}
      <path d="M9 18 C6 30, 8 40, 13 44" fill="none" stroke="#c9c9cf" strokeWidth="2" strokeLinecap="round" />
      <path d="M25 18 C28 30, 26 40, 21 44" fill="none" stroke="#a9a9b2" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 44 Q17 46 21 44" fill="none" stroke="#b9b9c1" strokeWidth="2" strokeLinecap="round" />
      {/* black clip body */}
      <path d="M4 2h26l-3 17H7z" fill="#1d1b1f" />
      <path d="M6 3h22l-.6 3.5H6.6z" fill="#3a373d" />
    </svg>
  )
}

/* ---------- The stuffed contents: each loose item in the pocket is a nav link ---------- */

/** Crumpled kraft / cream paper: light and shadow streaks at different angles. */
const crumpled = (base: string) =>
  [
    "linear-gradient(115deg, transparent 0 18%, rgb(255 255 255 / 45%) 22%, transparent 30%)",
    "linear-gradient(70deg, transparent 0 40%, rgb(120 90 60 / 18%) 46%, transparent 52%)",
    "linear-gradient(160deg, transparent 0 58%, rgb(255 255 255 / 35%) 63%, transparent 70%)",
    "linear-gradient(20deg, transparent 0 72%, rgb(120 90 60 / 14%) 78%, transparent 86%)",
    base,
  ].join(", ")

const grid = [
  "linear-gradient(rgb(70 70 85 / 20%) 1px, transparent 1px) 0 0 / 11px 11px",
  "linear-gradient(90deg, rgb(70 70 85 / 20%) 1px, transparent 1px) 0 0 / 11px 11px",
  "#fbfbfa",
].join(", ")

type Item = {
  href: string
  label: string
  /** Position on the 1240px stage. Every sheet starts under the cover (top < 52). */
  left: number
  top: number
  width: number
  /** Total length. Sheets lower in a stack are longer, so a strip of them sticks out below the one on top. */
  height: number
  rotate: number
  z: number
  /** Where along the bottom strip the label sits (0–100 %), so labels in one stack never line up. */
  labelAt: number
  style: CSSProperties
  ink: string
  extra?: ReactNode
}

function PocketItem({ item, active }: { item: Item; active: boolean }) {
  return (
    <motion.div
      className="pocket-wrap absolute"
      style={{ left: item.left, top: item.top, width: item.width, height: item.height, zIndex: item.z, transformOrigin: "50% 0" }}
      initial={false}
      // Pulled out of the pile a little when active, a little more on hover.
      animate={{ y: active ? 5 : 0, rotate: active ? item.rotate * 0.5 : item.rotate }}
      whileHover={{ y: 12, rotate: item.rotate * 0.4 }}
      whileTap={{ y: 8 }}
      transition={spring}
    >
      <Link href={item.href} aria-current={active ? "page" : undefined} className="pocket-item block h-full w-full" style={item.style}>
        <span
          className="absolute bottom-[7px] -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap uppercase tracking-[0.26em]"
          style={{ left: `${item.labelAt}%`, color: item.ink }}
        >
          {item.label}
        </span>
      </Link>
      {item.extra}
      {active && (
        <span className="pointer-events-none absolute bottom-[2px]" style={{ left: `calc(${item.labelAt}% - 64px)` }}>
          <StarSticker size={20} className="rotate-[-14deg] drop-shadow" />
        </span>
      )}
    </motion.div>
  )
}

export function FolderNav() {
  const { copy, locale, setLocale } = useLanguage()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMenuOpen(false), [pathname])

  const nav = copy.nav.content

  // Two messy stacks of long sheets, one each side of the folder. In each stack the top sheet is
  // the shortest; every sheet underneath is ~34px longer, so a clickable strip with its label
  // sticks out below the one above it (and out from under the folder's back flap).
  const items: Item[] = [
    // ----- left stack (top → bottom of the pile) -----
    {
      href: "/tutorials", label: nav.tutorials, left: 64, top: 22, width: 480, height: 72, rotate: -1.2, z: 6, labelAt: 62, ink: "#5a4630",
      style: { background: crumpled("#e6d6bb"), clipPath: "polygon(0 0, 100% 0, 99% 86%, 93% 100%, 74% 93%, 52% 100%, 30% 94%, 9% 100%, 0 91%)" },
    },
    {
      href: "/vlogs", label: nav.vlogs, left: 30, top: 20, width: 520, height: 108, rotate: 1, z: 5, labelAt: 26, ink: "#ffffff",
      style: {
        background: "radial-gradient(circle at 18% 60%, rgb(214 160 120 / 55%), transparent 22%), radial-gradient(circle at 70% 45%, rgb(150 110 90 / 50%), transparent 24%), linear-gradient(180deg, #4a4048, #26222a)",
        boxShadow: "inset 0 0 0 4px #f7f3ee",
      },
    },
    {
      href: "/projects", label: nav.projects, left: 92, top: 18, width: 556, height: 144, rotate: -0.8, z: 4, labelAt: 72, ink: "#2e2a33",
      style: { background: grid },
      extra: <BinderClip className="pointer-events-none absolute bottom-[-16px] left-[38%] z-10 drop-shadow-md" />,
    },
    // ----- right stack (top → bottom of the pile) -----
    {
      href: "/travels", label: nav.travels, left: 664, top: 22, width: 440, height: 70, rotate: 1.2, z: 6, labelAt: 34, ink: "#ffffff",
      style: {
        background: "radial-gradient(ellipse at 60% 130%, rgb(244 196 160 / 90%), transparent 55%), linear-gradient(180deg, #8fb3d6, #c7a9b8)",
        boxShadow: "inset 0 0 0 4px #f7f3ee",
      },
    },
    {
      href: "/thoughts", label: nav.thoughts, left: 630, top: 20, width: 500, height: 106, rotate: -1, z: 5, labelAt: 74, ink: "#5a4630",
      style: { background: crumpled("#f0e6d2"), clipPath: "polygon(0 0, 100% 0, 100% 93%, 86% 100%, 62% 95%, 38% 100%, 16% 94%, 0 100%)" },
    },
    {
      href: "/progress", label: nav.progress, left: 690, top: 18, width: 520, height: 140, rotate: 0.8, z: 4, labelAt: 40, ink: "#3a3540",
      style: {
        background: "repeating-linear-gradient(180deg, transparent 0 10px, rgb(110 120 160 / 20%) 10px 11px), #ececea",
        borderRadius: "0 0 6px 6px",
      },
    },
  ]

  const mobileLinks = [{ href: "/", label: copy.nav.home }, ...items.map(({ href, label }) => ({ href, label }))]

  const languageButtons = (variant: "cover" | "menu") =>
    locales.map((code) => (
      <motion.button
        key={code}
        type="button"
        aria-pressed={locale === code}
        onClick={() => setLocale(code)}
        whileTap={{ scale: 0.92 }}
        className={variant === "cover" ? "folder-lang" : "folder-lang folder-lang--menu"}
      >
        {code.toUpperCase()}
      </motion.button>
    ))

  return (
    <header className="folder-nav sticky top-0 z-40">
      {/* ================= Desktop: the upside-down pink folder ================= */}
      <div className="relative mx-auto hidden h-[164px] w-[min(1240px,calc(100%-24px))] overflow-x-clip lg:block">
        {/* Back flap: deeper on the left, stepping up on the right like a folder's tab cut. */}
        <div className="folder-flap absolute top-[34px] left-0 h-[86px] w-[71%] rounded-b-[16px]" />
        <div className="folder-flap absolute top-[34px] right-0 h-[66px] w-[29.5%] rounded-br-[16px]" />
        {/* concave curve joining the two flap levels */}
        <span aria-hidden="true" className="folder-flap-curve absolute top-[100px] left-[71%] size-4" />

        {/* Contents stuffed into the pocket (the nav links): a fixed 1240px stage, scaled down on smaller screens */}
        <nav
          aria-label={copy.nav.explore}
          className="absolute top-0 left-1/2 z-[2] h-full w-[1240px] -translate-x-1/2 origin-top max-xl:scale-[0.8]"
        >
          {items.map((item) => (
            <PocketItem key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </nav>

        {/* Front cover */}
        <div className="folder-cover absolute inset-x-0 top-0 z-[3] h-[52px]">
          <div className="relative flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <StarSticker size={34} className="-mt-1 rotate-[-12deg] drop-shadow-sm" />
              {/* printed upside down, because the folder is */}
              <span aria-hidden="true" className="rotate-180 font-serif-display text-[11px] tracking-[0.5em] text-[#fbe3e8] uppercase">
                Portfolio
              </span>
            </div>

            <Link
              href="/"
              aria-label="Ilina Boclincă — home"
              aria-current={pathname === "/" ? "page" : undefined}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl px-3 py-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Logo />
            </Link>

            <div className="mr-8 flex gap-1" role="group" aria-label="Language">{languageButtons("cover")}</div>
          </div>
          <PaperClip className="pointer-events-none absolute -top-3 right-5 rotate-[8deg] drop-shadow-sm" />
        </div>
      </div>

      {/* ================= Mobile & tablet (< 1024px): compact cover + hamburger ================= */}
      <div className="folder-cover folder-cover--mobile flex items-center justify-between px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <StarSticker size={26} className="rotate-[-12deg]" />
          <Link href="/" aria-label="Ilina Boclincă — home"><Logo compact /></Link>
        </div>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full text-[#5a2232] transition-colors hover:bg-white/25"
          aria-label={menuOpen ? copy.nav.close : copy.nav.menu}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-5" strokeWidth={1.75} /> : <Menu className="size-5" strokeWidth={1.75} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label={copy.nav.explore}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="mobile-paper-menu absolute inset-x-3 top-full mt-2 p-3 lg:hidden"
            style={{ background: grid }}
          >
            <ul className="grid gap-1">
              {mobileLinks.map((link) => {
                const active = link.href === "/" ? pathname === "/" : isActive(pathname, link.href)
                return (
                  <li key={link.href}>
                    <Link href={link.href} aria-current={active ? "page" : undefined} className="mobile-paper-link">
                      {active && <StarSticker size={16} />}
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <div className="mt-3 flex justify-center gap-2 border-t border-[#2e2530]/10 pt-3" role="group" aria-label="Language">
              {languageButtons("menu")}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
