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

/** Wordmark: "Lizard" in script with the silver rhinestone (glitter) texture. */
function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`rhinestone-text font-script leading-[1.2] ${compact ? "text-[32px]" : "text-[38px]"}`}
    >
      Lizard
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
        fill="#fe8616" stroke="#d9fb5f" strokeWidth="2.4" strokeLinejoin="round"
      />
      <path d="M20 9.5l2.7 5.9 6.4.7-4.8 4.3 1.4 6.3L20 23.5l-5.7 3.2 1.4-6.3-4.8-4.3 6.4-.7z" fill="#ffa24d" />
    </svg>
  )
}

function PaperClip({ className = "" }: { className?: string }) {
  const d = "M15 14V43a5 5 0 0 1-10 0V9a7 7 0 0 1 14 0v38a9 9 0 0 1-18 0V18"
  return (
    <svg aria-hidden="true" width="22" height="58" viewBox="0 0 22 58" className={className}>
      <path d={d} fill="none" stroke="#7b46f8" strokeWidth="1" strokeLinecap="round" transform="translate(0.8 0.8)" opacity="0.55" />
      <path d={d} fill="none" stroke="#d9fb5f" strokeWidth="2.4" strokeLinecap="round" />
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
    "linear-gradient(70deg, transparent 0 40%, rgb(90 90 100 / 16%) 46%, transparent 52%)",
    "linear-gradient(160deg, transparent 0 58%, rgb(255 255 255 / 35%) 63%, transparent 70%)",
    "linear-gradient(20deg, transparent 0 72%, rgb(90 90 100 / 12%) 78%, transparent 86%)",
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
  /** Horizontal position and width in % of the folder width. Every sheet starts under the cover. */
  left: number
  width: number
  /** Total length. Sheets lower in a stack are longer, so a strip of them sticks out below the one on top. */
  height: number
  rotate: number
  z: number
  /** Where along the bottom strip the label sits (0–100 %), so labels in one stack never line up. */
  labelAt: number
  style: CSSProperties
  /**
   * How the label is "printed" on this particular sheet: a rubber stamp, a camcorder overlay,
   * marker handwriting, a camera date stamp, ballpoint pen, typewriter + highlighter.
   */
  ink: "stamp" | "camcorder" | "marker" | "datestamp" | "pen" | "typewriter" | "postmark"
  extra?: ReactNode
}

function PocketItem({ item, active }: { item: Item; active: boolean }) {
  return (
    <motion.div
      className="pocket-wrap absolute"
      style={{ left: `${item.left}%`, top: 14, width: `${item.width}%`, height: item.height, zIndex: item.z, transformOrigin: "50% 0" }}
      initial={false}
      // Pulled out of the pile a little when active, a little more on hover.
      animate={{ y: active ? 3 : 0, rotate: item.rotate }}
      whileHover={{ y: 8 }}
      whileTap={{ y: 5 }}
      transition={spring}
    >
      <Link href={item.href} aria-current={active ? "page" : undefined} className="pocket-item block h-full w-full" style={item.style}>
        <span className={`sheet-label sheet-label--${item.ink}`} style={{ left: `${item.labelAt}%` }}>
          {item.ink === "camcorder" && <span className="sheet-rec" aria-hidden="true" />}
          {item.label}
        </span>
      </Link>
      {item.extra}
      {active && (
        <span className="pointer-events-none absolute bottom-[1px]" style={{ left: `calc(${item.labelAt}% - 78px)` }}>
          <StarSticker size={17} className="rotate-[-14deg] drop-shadow" />
        </span>
      )}
    </motion.div>
  )
}

/* ---------- Scrolled state: the folder makes way for a column of 8 small dots ---------- */

const DOT_COLORS = ["#ff66a9", "#d9fb5f", "#fe8616", "#7b46f8"] as const

/** True once the page is scrolled past the folder; false again at the very top. */
function useScrolledPast(threshold: number) {
  const [past, setPast] = useState(false)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setPast(window.scrollY > threshold)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [threshold])
  return past
}

function DotNav({ links, pathname, label }: { links: { href: string; label: string }[]; pathname: string; label: string }) {
  return (
    <motion.nav
      aria-label={label}
      className="fixed top-1/2 left-4 z-50 hidden -translate-y-1/2 lg:block"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
    >
      <ul className="flex flex-col gap-1">
        {links.map((link, i) => {
          const active = link.href === "/" ? pathname === "/" : isActive(pathname, link.href)
          const color = DOT_COLORS[i % DOT_COLORS.length]
          return (
            <motion.li
              key={link.href}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.035, type: "spring", stiffness: 500, damping: 26 }}
            >
              <Link
                href={link.href}
                aria-label={link.label}
                aria-current={active ? "page" : undefined}
                className="dot-link group relative flex size-6 items-center justify-center"
                style={{ "--dot": color } as CSSProperties}
              >
                <span className="dot" aria-hidden="true" />
                {/* where it goes: shown on hover / keyboard focus */}
                <span className="dot-tip" aria-hidden="true">{link.label}</span>
              </Link>
            </motion.li>
          )
        })}
      </ul>
    </motion.nav>
  )
}

export function FolderNav() {
  const { copy, locale, setLocale } = useLanguage()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMenuOpen(false), [pathname])
  // the desktop folder is ~168px tall; once it has scrolled away, show the dots instead
  const scrolled = useScrolledPast(140)

  const nav = copy.nav.content

  // One stack of long, whole sheets and photo strips spanning the full width of the folder, crossing
  // each other on alternating diagonals. Positions are in % of the folder width, so the stack grows
  // with the screen. Top sheet first; each sheet below reaches 13px lower. Because the tilts
  // alternate, every sheet sticks out most on one side, and its label sits right there.
  const items: Item[] = [
    {
      href: "/tutorials", label: nav.tutorials, left: 5, width: 88, height: 54, rotate: 1.8, z: 10, labelAt: 87, ink: "stamp",
      style: { background: crumpled("#e7e7e4"), clipPath: "polygon(0 0, 100% 0, 100% 90%, 94% 100%, 76% 94%, 58% 100%, 38% 95%, 18% 100%, 0 93%)" },
    },
    {
      href: "/vlogs", label: nav.vlogs, left: 2, width: 94, height: 67, rotate: -1.6, z: 9, labelAt: 10, ink: "camcorder",
      style: {
        background: "radial-gradient(circle at 22% 55%, rgb(190 190 195 / 40%), transparent 14%), radial-gradient(circle at 64% 45%, rgb(140 140 148 / 40%), transparent 16%), linear-gradient(180deg, #5b5b61, #2f2f34)",
        boxShadow: "inset 0 0 0 4px #f7f3ee",
      },
    },
    {
      href: "/projects", label: nav.projects, left: 6, width: 90, height: 80, rotate: 1.7, z: 8, labelAt: 83, ink: "marker",
      style: { background: grid },
    },
    {
      href: "/courses", label: nav.courses, left: 3, width: 93, height: 93, rotate: -1.5, z: 7, labelAt: 24, ink: "datestamp",
      style: {
        background: "radial-gradient(ellipse at 40% 130%, rgb(255 255 255 / 70%), transparent 45%), linear-gradient(180deg, #a9a9ae, #d2d2d5)",
        boxShadow: "inset 0 0 0 4px #f7f3ee",
      },
    },
    {
      href: "/thoughts", label: nav.thoughts, left: 7, width: 88, height: 106, rotate: 1.9, z: 6, labelAt: 76, ink: "pen",
      style: { background: crumpled("#fafaf9"), clipPath: "polygon(0 0, 100% 0, 100% 96%, 88% 100%, 66% 97%, 42% 100%, 20% 97%, 0 100%)" },
    },
    {
      href: "/progress", label: nav.progress, left: 2, width: 95, height: 119, rotate: -1.4, z: 5, labelAt: 12, ink: "typewriter",
      style: {
        background: "repeating-linear-gradient(180deg, transparent 0 10px, rgb(110 120 160 / 20%) 10px 11px), #ececea",
        borderRadius: "0 0 6px 6px",
      },
    },
    {
      // an envelope with grey "airmail" edging
      href: "/#contact", label: copy.nav.contact, left: 5, width: 91, height: 132, rotate: 1.6, z: 4, labelAt: 90, ink: "postmark",
      style: {
        border: "5px solid transparent",
        background: "linear-gradient(#ffffff, #ffffff) padding-box, repeating-linear-gradient(135deg, #cfcfcc 0 9px, #ffffff 9px 18px) border-box",
        borderRadius: "0 0 4px 4px",
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
    <header className="folder-nav sticky top-0 z-40 lg:relative">
      {/* ================= Desktop: the upside-down pink folder ================= */}
      <div className="relative mx-auto hidden h-[168px] w-[min(1680px,calc(100%-24px))] overflow-x-clip lg:block">
        {/* Back flap: deeper on the left, stepping up on the right like a folder's tab cut. */}
        <div className="folder-flap absolute top-[30px] left-0 h-[134px] w-[72%] rounded-b-[18px]" />
        <div className="folder-flap absolute top-[30px] right-0 h-[110px] w-[28.5%] rounded-br-[18px]" />
        {/* concave curve joining the two flap levels */}
        <span aria-hidden="true" className="folder-flap-curve absolute top-[140px] left-[72%] size-[18px]" />

        {/* Contents stuffed into the pocket (the nav links), spanning the whole folder */}
        <nav aria-label={copy.nav.explore} className="absolute inset-0 z-[2]">
          {items.map((item) => (
            <PocketItem key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </nav>

        {/* Front cover */}
        <div className="folder-cover absolute inset-x-0 top-0 z-[3] h-[52px]">
          <div className="relative flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <StarSticker size={34} className="-mt-1 rotate-[-12deg] drop-shadow-sm" />
            </div>

            <Link
              href="/"
              aria-label="Lizard — home"
              aria-current={pathname === "/" ? "page" : undefined}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl px-3 py-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Logo />
            </Link>

            <div className="mr-8 flex gap-1" role="group" aria-label="Language">{languageButtons("cover")}</div>
          </div>
          <PaperClip className="pointer-events-none absolute -top-3 right-5 rotate-[8deg] drop-shadow-sm" />
          {/* binder clip gripping the cover's lower edge, holding the folder shut over the papers */}
          <BinderClip className="pointer-events-none absolute -bottom-[34px] left-[30%] drop-shadow-md" />
        </div>
      </div>

      {/* ================= Mobile & tablet (< 1024px): compact cover + hamburger ================= */}
      <div className="folder-cover folder-cover--mobile flex items-center justify-between px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <StarSticker size={26} className="rotate-[-12deg]" />
          <Link href="/" aria-label="Lizard — home"><Logo compact /></Link>
        </div>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full text-[#7b46f8] transition-colors hover:bg-white/25"
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
      <AnimatePresence>
        {scrolled && <DotNav links={mobileLinks} pathname={pathname} label={copy.nav.explore} />}
      </AnimatePresence>
    </header>
  )
}
