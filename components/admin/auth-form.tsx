"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowUpRight, LockKeyhole } from "lucide-react"
import { signIn } from "@/lib/auth/actions"

export function AuthForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    try {
      const result = await signIn(email, password)
      if (result.error) {
        setError("Email sau parolă greșită. Verifică datele și încearcă din nou.")
        return
      }

      router.replace("/admin")
      router.refresh()
    } catch {
      setError("Autentificarea nu este disponibilă momentan. Încearcă din nou.")
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="admin-auth-main">
      <section className="admin-auth-card" aria-labelledby="auth-title">
        <div className="admin-auth-icon" aria-hidden="true"><LockKeyhole /></div>
        <span className="admin-eyebrow">Spațiu privat</span>
        <h1 id="auth-title">Bine ai revenit</h1>
        <p>Autentifică-te pentru a edita paginile și materialele site-ului.</p>

        <form className="admin-auth-form" onSubmit={handleSubmit}>
          <label htmlFor="owner-email">Email</label>
          <input
            id="owner-email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label htmlFor="owner-password">Parolă</label>
          <input
            id="owner-password"
            type="password"
            autoComplete="current-password"
            maxLength={128}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error && <p className="admin-form-error" role="alert">{error}</p>}
          <button className="admin-primary-button" type="submit" disabled={pending}>
            {pending ? "Se procesează…" : "Intră în panou"}
            {!pending && <ArrowUpRight aria-hidden="true" />}
          </button>
        </form>

        <Link className="admin-auth-back" href="/">Înapoi la portofoliu</Link>
      </section>
    </main>
  )
}
