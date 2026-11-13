"use client"

import { useEffect } from "react"
import { AboutSection } from "./about-section"
import { ContactSection } from "./contact-section"
import type { HeroSlotData } from "@/lib/content/types"
import { HeroSection } from "./hero-section"
import { ServicesSection } from "./services-section"
import { WorkSection } from "./work-section"

// The navbar, background, audio player and LanguageProvider live in the root layout (SiteShell).
export function PortfolioSite({ slot }: { slot: HeroSlotData }) {
  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>("[data-reveal]")
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible")
          currentObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" })

    revealElements.forEach((element) => observer.observe(element))

    const onPointerMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 14
      const y = (event.clientY / window.innerHeight - 0.5) * 14
      document.documentElement.style.setProperty("--parallax-x", `${x}px`)
      document.documentElement.style.setProperty("--parallax-y", `${y}px`)
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener("pointermove", onPointerMove)
    }
  }, [])

  return (
    <div className="portfolio-site">
      <main>
        <HeroSection slot={slot} />
        <AboutSection />
        <WorkSection />
        <ServicesSection />
        <ContactSection />
      </main>
    </div>
  )
}
