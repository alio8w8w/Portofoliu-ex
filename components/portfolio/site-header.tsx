"use client"

import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react"
import { useState } from "react"
import { useLanguage, type Locale } from "./language-context"

const locales: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ro", label: "RO" },
  { code: "ru", label: "RU" },
]

export function SiteHeader() {
  const { locale, setLocale, copy } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const links = [
    { href: "#about", label: copy.nav.about },
    { href: "#work", label: copy.nav.work },
    { href: "/services", label: copy.nav.services },
    { href: "#contact", label: copy.nav.contact },
  ]
  const contentLinks = [
    { href: "/projects", label: copy.nav.content.projects },
    { href: "/travels", label: copy.nav.content.travels },
    { href: "/vlogs", label: copy.nav.content.vlogs },
    { href: "/thoughts", label: copy.nav.content.thoughts },
    { href: "/tutorials", label: copy.nav.content.tutorials },
    { href: "/progress", label: copy.nav.content.progress },
  ]

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="wordmark" href="#home" aria-label="Ilina Boclincă — home">
          <span className="wordmark-mark">i<span>.</span></span>
          <span>ilina boclincă</span>
        </a>
        <nav className={`main-nav${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>
          ))}
          <details className="nav-dropdown">
            <summary>{copy.nav.explore}<ChevronDown aria-hidden="true" /></summary>
            <div className="nav-dropdown-panel">
              {contentLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}<ArrowUpRight aria-hidden="true" /></a>
              ))}
            </div>
          </details>
          <div className="mobile-nav-languages" aria-label="Choose language">
            {locales.map(({ code, label }) => (
              <button key={code} type="button" aria-pressed={locale === code} onClick={() => setLocale(code)}>{label}</button>
            ))}
          </div>
        </nav>
        <div className="header-actions">
          <div className="language-switcher" role="group" aria-label="Choose language">
            {locales.map(({ code, label }) => (
              <button key={code} type="button" aria-pressed={locale === code} onClick={() => setLocale(code)}>{label}</button>
            ))}
          </div>
          <a className="button button-small header-cta" href="#contact">{copy.nav.cta}<ArrowUpRight aria-hidden="true" /></a>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? copy.nav.close : copy.nav.menu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  )
}
