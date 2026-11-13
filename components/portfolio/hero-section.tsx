"use client"

import { ArrowDownRight, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react"
import { SlotMachine } from "@/components/hero/slot-machine"
import type { HeroSlotData } from "@/lib/content/types"
import { useLanguage } from "./language-context"

export function HeroSection({ slot }: { slot: HeroSlotData }) {
  const { copy } = useLanguage()

  return (
    <section className="hero-section section-pad" id="home" aria-labelledby="hero-title">
      <div className="hero-grid page-width">
        <div className="hero-copy hero-copy-glass" data-reveal>
          <div className="eyebrow"><span className="eyebrow-dot" />{copy.hero.eyebrow}</div>
          <h1 id="hero-title">{copy.hero.title}</h1>
          <p className="hero-intro">{copy.hero.intro}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#contact">{copy.hero.primary}<ArrowUpRight aria-hidden="true" /></a>
            <a className="text-link" href="#work">{copy.hero.secondary}<ArrowRight aria-hidden="true" /></a>
          </div>
          <div className="hero-meta">
            <span className="location-pin"><span />{copy.hero.note}</span>
            <span className="hero-scroll"><ArrowDownRight aria-hidden="true" />{copy.hero.scroll}</span>
          </div>
        </div>
        <div className="hero-art-wrap hero-slot-wrap" data-reveal>
          <SlotMachine data={slot} />
          <div className="floating-sticker sticker-star" aria-hidden="true"><Sparkles /></div>
          <div className="floating-sticker sticker-note" aria-hidden="true">{copy.hero.sticker}</div>
        </div>
      </div>
      <div className="hero-bottom page-width" aria-hidden="true">
        <span>DESIGN WITH FEELING</span><span className="hero-bottom-star">✳</span><span>BUILD WITH CARE</span><span className="hero-bottom-star">✳</span><span>STAY CURIOUS</span>
      </div>
    </section>
  )
}
