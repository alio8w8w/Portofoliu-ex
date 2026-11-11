"use client"

import { ArrowDownRight, ArrowUpRight, Code2, PenTool, Sparkles } from "lucide-react"
import { useLanguage } from "./language-context"

const serviceIcons = [PenTool, Code2, Sparkles]

export function ServicesSection() {
  const { copy } = useLanguage()

  return (
    <section className="services-section section-pad" id="services" aria-labelledby="services-title">
      <div className="services-layout page-width">
        <div className="services-intro" data-reveal>
          <div className="eyebrow eyebrow-light"><span className="eyebrow-dot" />{copy.services.eyebrow}</div>
          <h2 id="services-title">{copy.services.title}</h2>
          <p>{copy.services.intro}</p>
          <a className="button button-light" href="#contact">{copy.services.cta}<ArrowDownRight aria-hidden="true" /></a>
          <div className="services-flower" aria-hidden="true"><Sparkles /></div>
        </div>
        <div className="service-list">
          {copy.services.items.map((item, index) => {
            const Icon = serviceIcons[index]
            return (
              <article className="service-card" key={item.number} data-reveal>
                <div className="service-card-top"><span>{item.number}</span><Icon aria-hidden="true" /></div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <a href="#contact" aria-label={`${copy.nav.cta}: ${item.title}`}><ArrowUpRight aria-hidden="true" /></a>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
