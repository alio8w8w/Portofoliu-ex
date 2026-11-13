"use client"

// Shown inside the admin layout (header + sign-out stay visible) when a page fails to load,
// most often because DATABASE_URL is missing or the database is unreachable.
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="admin-main">
      <section className="admin-welcome">
        <div>
          <span className="admin-eyebrow">Ceva nu a mers</span>
          <h1>Datele nu au putut fi încărcate<span>.</span></h1>
          <p>
            Cel mai probabil baza de date nu este conectată. Verifică dacă <code>DATABASE_URL</code> este
            setat în fișierul <code>.env</code> și dacă tabelele există, apoi încearcă din nou.
          </p>
        </div>
        <button className="admin-primary-button admin-welcome-action" type="button" onClick={reset}>
          Încearcă din nou
        </button>
      </section>
    </main>
  )
}
