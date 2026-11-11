"use client"

import Image from "next/image"
import { ArrowDownRight, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react"
import { useLanguage } from "./language-context"

export function HeroSection() {
  const { copy } = useLanguage()
  const [titleLead, titleFinish] = copy.hero.title.split("\n")

  return (
    <section className="hero-section section-pad" id="home" aria-labelledby="hero-title">
      <div className="hero-grid page-width">
        <div className="hero-copy" data-reveal>
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
        <div className="hero-art-wrap" data-reveal>
          <div className="hero-art-frame">
            <div className="hero-checker" aria-hidden="true" />
            <Image
              className="hero-art-image"
              src="/images/ilina-hero-collage.png"
              alt="A playful collage of a film camera, laptop, and engineering notebook"
              fill
              priority
              sizes="(max-width: 760px) 88vw, 43vw"
            />
            <div className="hero-image-caption">{copy.hero.eyebrow}</div>
          </div>
          <div className="floating-sticker sticker-star" aria-hidden="true"><Sparkles /></div>
          <div className="floating-sticker sticker-note" aria-hidden="true">{copy.hero.sticker}</div>
          <div className="floating-sticker sticker-stamp" aria-hidden="true"><span>MADE WITH</span><strong>curiosity</strong><span>+ good ideas</span></div>
          <div className="hero-art-arrow" aria-hidden="true"><ArrowDownRight /></div>
        </div>
      </div>
      <div className="hero-bottom page-width" aria-hidden="true">
        <span>DESIGN WITH FEELING</span><span className="hero-bottom-star">✳</span><span>BUILD WITH CARE</span><span className="hero-bottom-star">✳</span><span>STAY CURIOUS</span>
      </div>
    </section>
  )
}
