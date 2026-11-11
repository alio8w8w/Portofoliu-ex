"use client"

import { ArrowUpRight, Camera, Code2, Heart, Microscope, Sparkles } from "lucide-react"
import { useLanguage } from "./language-context"

const factIcons = [Microscope, Code2, Camera]

export function AboutSection() {
  const { copy } = useLanguage()

  return (
    <section className="about-section section-pad" id="about" aria-labelledby="about-title">
      <div className="about-grid page-width">
        <div className="about-heading" data-reveal>
          <div className="eyebrow"><span className="eyebrow-dot" />{copy.about.eyebrow}</div>
          <h2 id="about-title">{copy.about.title}</h2>
          <div className="about-sticker floating-sticker" aria-hidden="true"><Heart /><span>full of<br />wonder</span></div>
        </div>
        <div className="about-body" data-reveal>
          <p className="about-lead">{copy.about.body}</p>
          <p>{copy.about.bodyTwo}</p>
          <div className="about-current"><span className="current-sparkle">✳</span><div><span>{copy.about.currently}</span><strong>{copy.about.currentlyValue}</strong></div></div>
          <a className="text-link about-link" href="#contact">{copy.nav.cta}<ArrowUpRight aria-hidden="true" /></a>
        </div>
      </div>
      <div className="facts-row page-width" data-reveal>
        {copy.about.facts.map((fact, index) => {
          const Icon = factIcons[index]
          return <div className="fact-item" key={fact}><Icon aria-hidden="true" /><span>{fact}</span></div>
        })}
        <span className="facts-note">{copy.about.note}</span>
      </div>
    </section>
  )
}
