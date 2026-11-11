"use client"

import { ArrowUpRight, Play } from "lucide-react"
import { useLanguage } from "./language-context"

function ProjectArt({ kind }: { kind: "market" | "challenge" | "science" }) {
  if (kind === "market") {
    return (
      <div className="project-art market-art" aria-hidden="true">
        <div className="mock-browser"><span /><span /><span /></div>
        <div className="market-art-content"><span className="market-mini-label">GOOD THINGS INSIDE</span><strong>good<br />mood.</strong><div className="market-fruit"><i /><i /><i /></div><span className="market-mini-button">SHOP THE FEELING ↗</span></div>
        <span className="art-badge">GOOD<br />DAY!</span>
      </div>
    )
  }
  if (kind === "challenge") {
    return (
      <div className="project-art challenge-art" aria-hidden="true">
        <div className="challenge-grid"><span>DAY</span><strong>01</strong><span>OF 30</span></div>
        <div className="play-sticker"><Play fill="currentColor" /></div>
        <div className="challenge-code"><i /><i /><i /><i /></div>
        <span className="challenge-ribbon">LEARNING OUT LOUD</span>
      </div>
    )
  }
  return (
    <div className="project-art science-art" aria-hidden="true">
      <div className="science-head"><span>THE</span><strong>SOFT<br />SCIENCE</strong><span>OF EVERYDAY THINGS</span></div>
      <div className="science-cell"><i /><i /><i /><i /><i /><i /><b /></div>
      <div className="science-footer"><span>FIELD NOTE No. 03</span><span>2025 — 01</span></div>
      <span className="science-orbit">✳</span>
    </div>
  )
}

export function WorkSection() {
  const { copy } = useLanguage()
  const projects = [
    { kind: "market" as const, title: copy.work.projectOne, description: copy.work.projectOneDesc, tag: copy.work.projectOneTag, label: copy.work.concept, number: "01" },
    { kind: "challenge" as const, title: copy.work.projectTwo, description: copy.work.projectTwoDesc, tag: copy.work.projectTwoTag, label: copy.work.challenge, number: "02" },
    { kind: "science" as const, title: copy.work.projectThree, description: copy.work.projectThreeDesc, tag: copy.work.projectThreeTag, label: copy.work.editorial, number: "03" },
  ]

  return (
    <section className="work-section section-pad" id="work" aria-labelledby="work-title">
      <div className="work-heading page-width" data-reveal>
        <div><div className="eyebrow"><span className="eyebrow-dot" />{copy.work.eyebrow}</div><h2 id="work-title">{copy.work.title}</h2></div>
        <p>{copy.work.intro}</p>
      </div>
      <div className="project-grid page-width">
        {projects.map((project) => (
          <article className={`project-card project-${project.kind}`} key={project.number} tabIndex={0} data-reveal>
            <div className="project-art-shell">
              <ProjectArt kind={project.kind} />
              <span className="project-number">{project.number}</span>
              <span className="project-visual-label">{project.label}</span>
              <div className="project-reveal"><span>{copy.work.view}</span><ArrowUpRight aria-hidden="true" /></div>
            </div>
            <div className="project-caption">
              <div><span className="project-tag">{project.tag}</span><h3>{project.title}</h3><p>{project.description}</p></div>
              <ArrowUpRight className="project-caption-arrow" aria-hidden="true" />
            </div>
          </article>
        ))}
      </div>
      <a className="challenge-link page-width" href="https://www.tiktok.com/" target="_blank" rel="noreferrer">
        <span className="challenge-link-icon"><Play fill="currentColor" aria-hidden="true" /></span>
        <span>{copy.work.challengeCta}</span><ArrowUpRight aria-hidden="true" />
      </a>
    </section>
  )
}
