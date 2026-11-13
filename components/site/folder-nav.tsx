"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage, type Locale } from "@/components/portfolio/language-context"

const locales: Locale[] = ["en", "ro", "ru"]

// Am schimbat tonurile în culori neutre pentru a se potrivi cu orice background (lava, purpuriu, etc.)
type Tab = { href: string; label: string; tone: "white" | "light" | "dark" }

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Componenta Logo folosește acum fișierul imagine din public/img/logo.png */
function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center ${compact ? "w-24" : "w-32"}`}>
      <img 
        src="/img/logo.png" 
        alt="Ilinca Boclinca Logo" 
        className="w-full h-auto object-contain"
      />
    </div>
  )
}

export function FolderNav() {
  const { copy, locale, setLocale } = useLanguage()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMenuOpen(false), [pathname])

  // Repartizarea noilor tonuri neutre
  const left: Tab[] = [
    { href: "/projects", label: copy.nav.content.projects, tone: "white" },
    { href: "/vlogs", label: copy.nav.content.vlogs, tone: "light" },
    { href: "/tutorials", label: copy.nav.content.tutorials, tone: "dark" },
  ]
  const right: Tab[] = [
    { href: "/travels", label: copy.nav.content.travels, tone: "dark" },
    { href: "/thoughts", label: copy.nav.content.thoughts, tone: "light" },
    { href: "/progress", label: copy.nav.content.progress, tone: "white" },
  ]

  const getTabStyles = (tone: string) => {
    switch (tone) {
      case "white": return "bg-white text-zinc-900 border-zinc-200"
      case "light": return "bg-zinc-100 text-zinc-900 border-zinc-300"
      case "dark": return "bg-zinc-800 text-white border-zinc-900"
      default: return "bg-white text-black"
    }
  }

  const renderTab = (tab: Tab, position: number, side: "left" | "right") => {
    const active = isActive(pathname, tab.href)
    const z = active ? 14 : side === "left" ? 10 + position : 13 - position
    
    return (
      <motion.div
        key={tab.href}
        className="relative"
        style={{ zIndex: z }}
        initial={false}
        // Animațiile sunt inversate: tab-urile coboară (+) când sunt active
        animate={{ y: active ? 7 : 0 }}
        whileHover={active ? undefined : { y: 3 }}
        whileTap={{ y: 9 }}
        transition={{ type: "spring", stiffness: 520, damping: 26 }}
      >
        <Link
          href={tab.href}
          aria-current={active ? "page" : undefined}
          // Folosim rounded-b pentru a le face să pară că atârnă de sus
          className={`flex items-center justify-center px-6 py-3 border border-t-0 rounded-b-2xl shadow-sm transition-colors text-xs font-bold tracking-[0.15em] uppercase ${getTabStyles(tab.tone)} ${active ? 'shadow-md' : ''}`}
        >
          {tab.label}
        </Link>
      </motion.div>
    )
  }

  return (
    <header className="fixed top-0 inset-x-0 z-40">
      
      {/* Bara de sus (Baza folderului) - acum stă deasupra tab-urilor */}
      <div className="hidden md:block relative z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200 shadow-sm">
        <div className="mx-auto flex h-10 w-[min(1260px,calc(100%-48px))] items-center justify-between">
          <span className="font-serif-display text-[10px] tracking-[0.3em] text-zinc-500 uppercase">Portfolio · Vol. 01</span>
          <div className="flex gap-2" role="group" aria-label="Language">
            {locales.map((code) => (
              <motion.button
                key={code}
                type="button"
                aria-pressed={locale === code}
                onClick={() => setLocale(code)}
                whileTap={{ scale: 0.94 }}
                className={`text-[10px] font-bold tracking-widest uppercase transition-colors px-2 py-1 rounded ${locale === code ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-900"}`}
              >
                {code}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: Tab-urile care atârnă sub bară */}
      <div className="relative mx-auto hidden w-[min(1260px,calc(100%-48px))] md:block">
        {/* items-start aliniază tab-urile de marginea de sus */}
        <nav aria-label={copy.nav.explore} className="-mt-1 flex items-start justify-center pb-4">
          <div className="flex items-start">{left.map((tab, i) => renderTab(tab, i, "left"))}</div>

          <motion.div
            className="relative z-30 -mt-1 mx-2"
            whileHover={{ y: 3 }}
            whileTap={{ y: 7 }}
            transition={{ type: "spring", stiffness: 520, damping: 26 }}
          >
            <Link 
              href="/" 
              aria-label="Ilinca Boclincă — home" 
              aria-current={pathname === "/" ? "page" : undefined} 
              className="flex items-center justify-center px-6 py-4 bg-white border border-t-0 border-zinc-200 rounded-b-[2rem] shadow-md"
            >
              <Logo />
            </Link>
          </motion.div>

          <div className="flex items-start">{right.map((tab, i) => renderTab(tab, i, "right"))}</div>
        </nav>
      </div>

      {/* Mobile: Păstrăm header-ul standard cu meniu hamburger */}
      <div className="flex items-center justify-between px-4 py-3 md:hidden bg-white/90 backdrop-blur-md border-b border-zinc-200 shadow-sm relative z-50">
        <Link href="/" aria-label="Ilinca Boclincă — home"><Logo compact /></Link>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-full bg-zinc-100 text-zinc-900 shadow-sm"
          aria-label={menuOpen ? copy.nav.close : copy.nav.menu}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label={copy.nav.explore}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-3 top-full mt-2 rounded-3xl p-3 md:hidden bg-white shadow-xl border border-zinc-100"
          >
            <ul className="grid gap-1">
              {[{ href: "/", label: copy.nav.home }, ...left, ...right].map((link) => {
                const active = link.href === "/" ? pathname === "/" : isActive(pathname, link.href)
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-2xl px-4 py-3 font-serif-display text-sm tracking-[0.14em] uppercase ${active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <div className="mt-3 flex justify-center gap-2 border-t border-zinc-100 pt-3" role="group" aria-label="Language">
              {locales.map((code) => (
                <button
                  key={code}
                  type="button"
                  aria-pressed={locale === code}
                  onClick={() => setLocale(code)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold ${locale === code ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"}`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}