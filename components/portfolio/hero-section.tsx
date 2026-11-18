"use client"

import { SlotMachine } from "@/components/hero/slot-machine"
import type { HeroSlotData } from "@/lib/content/types"
import { useLanguage } from "./language-context"

export function HeroSection({ slot }: { slot: HeroSlotData }) {
  const { copy } = useLanguage()

  return (
    <section className="hero-section section-pad" id="home" aria-labelledby="hero-title">
      {/* the intro card was removed; the heading stays for screen readers and SEO */}
      <h1 id="hero-title" className="sr-only">{copy.hero.title}</h1>
      <div className="hero-machine page-width">
        <SlotMachine data={slot} />
      </div>
      <div className="hero-bottom page-width" aria-hidden="true">
        <span>DESIGN WITH FEELING</span><span className="hero-bottom-star">✳</span><span>BUILD WITH CARE</span><span className="hero-bottom-star">✳</span><span>STAY CURIOUS</span>
      </div>
    </section>
  )
}
