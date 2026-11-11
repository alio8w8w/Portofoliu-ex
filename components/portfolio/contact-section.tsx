"use client"

import { ArrowRight, ArrowUpRight, Camera, Mail, Send } from "lucide-react"
import { useState, type FormEvent } from "react"
import { useLanguage } from "./language-context"

export function ContactSection() {
  const { copy } = useLanguage()
  const [status, setStatus] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const subject = encodeURIComponent(`Project inquiry from ${String(form.get("name"))}`)
    const body = encodeURIComponent([
      `Name: ${form.get("name")}`,
      `Email: ${form.get("email")}`,
      `Interested in: ${form.get("service")}`,
      "",
      String(form.get("message")),
    ].join("\n"))
    setStatus(copy.contact.success)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <section className="contact-section section-pad" id="contact" aria-labelledby="contact-title">
      <div className="contact-layout page-width">
        <div className="contact-copy" data-reveal>
          <div className="eyebrow"><span className="eyebrow-dot" />{copy.contact.eyebrow}</div>
          <h2 id="contact-title">{copy.contact.title}</h2>
          <p>{copy.contact.intro}</p>
          <div className="social-block">
            <span>{copy.contact.social}</span>
            <div className="social-links">
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer"><Camera aria-hidden="true" />Instagram<ArrowUpRight aria-hidden="true" /></a>
              <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer"><span className="tiktok-glyph" aria-hidden="true">♪</span>TikTok<ArrowUpRight aria-hidden="true" /></a>
            </div>
          </div>
          <a className="email-start" href="mailto:?subject=Hello%20Ilina"><Mail aria-hidden="true" />{copy.contact.emailFallback}<ArrowRight aria-hidden="true" /></a>
          <span className="social-footnote">Add your profile links and email address before publishing.</span>
        </div>
        <form className="contact-form" onSubmit={handleSubmit} data-reveal>
          <div className="form-row">
            <label>{copy.contact.name}<input autoComplete="name" name="name" placeholder={copy.contact.namePlaceholder} required /></label>
            <label>{copy.contact.email}<input autoComplete="email" name="email" type="email" placeholder={copy.contact.emailPlaceholder} required /></label>
          </div>
          <label>{copy.contact.service}
            <select name="service" defaultValue="" required>
              <option value="" disabled>{copy.contact.choose}</option>
              {copy.contact.serviceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>{copy.contact.message}<textarea name="message" placeholder={copy.contact.messagePlaceholder} rows={4} required /></label>
          <button className="button button-primary form-submit" type="submit">{copy.contact.send}<Send aria-hidden="true" /></button>
          <p className="form-note">{copy.contact.privacy}</p>
          <p className="form-status" aria-live="polite">{status}</p>
        </form>
      </div>
      <footer className="site-footer page-width">
        <a className="footer-mark" href="#home">ib<span>.</span></a>
        <span>{copy.contact.footer}</span>
        <a href="#home">{copy.contact.top}<ArrowUpRight aria-hidden="true" /></a>
        <span className="footer-year">© 2026</span>
      </footer>
    </section>
  )
}
