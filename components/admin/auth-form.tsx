"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowUpRight, LockKeyhole } from "lucide-react"
import { authClient } from "@/lib/auth/client"

export function AuthForm({ mode }: { mode: "sign-in" | "setup" }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isSetup = mode === "setup"

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    try {
      const result = isSetup
        ? await authClient.signUp.email({ email: email.trim(), password, name: "Ilina Boclincă" })
        : await authClient.signIn.email({ email: email.trim(), password })

      if (result.error) {
        setError(isSetup
          ? "Contul nu a putut fi creat. Verifică datele introduse și încearcă din nou."
          : "Nu s-a putut face autentificarea. Verifică datele și încearcă din nou.")
        return
      }

      router.replace("/admin")
      router.refresh()
    } catch {
      setError("Serviciul de autentificare nu este disponibil momentan. Încearcă din nou.")
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="admin-auth-main">
      <section className="admin-auth-card" aria-labelledby="auth-title">
        <div className="admin-auth-icon" aria-hidden="true"><LockKeyhole /></div>
        <span className="admin-eyebrow">Spațiu privat</span>
        <h1 id="auth-title">{isSetup ? "Creează contul de owner" : "Bine ai revenit"}</h1>
        <p>{isSetup
          ? "Primul cont este limitat la adresa configurată pentru owner."
          : "Autentifică-te pentru a edita paginile și materialele site-ului."}</p>

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
            autoComplete={isSetup ? "new-password" : "current-password"}
            minLength={8}
            maxLength={128}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error && <p className="admin-form-error" role="alert">{error}</p>}
          <button className="admin-primary-button" type="submit" disabled={pending}>
            {pending ? "Se procesează…" : isSetup ? "Creează contul" : "Intră în panou"}
            {!pending && <ArrowUpRight aria-hidden="true" />}
          </button>
        </form>

        <p className="admin-auth-switch">
          {isSetup ? "Ai deja un cont?" : "Este prima ta autentificare?"}{" "}
          <Link href={isSetup ? "/admin/sign-in" : "/admin/setup"}>
            {isSetup ? "Autentifică-te" : "Creează contul owner"}
          </Link>
        </p>
        <Link className="admin-auth-back" href="/">Înapoi la portofoliu</Link>
      </section>
    </main>
  )
}
