import Link from "next/link"
import { CONTENT_KINDS, CONTENT_META } from "@/lib/content/types"
import { SignOutButton } from "@/components/admin/sign-out-button"

export function AdminHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="admin-header">
      <div className="admin-header-top">
        <Link className="admin-brand" href="/admin" aria-label="Panou de administrare">
          <span className="admin-brand-mark">i<span>.</span></span>
          <span><strong>ilina boclincă</strong><small>studio · admin</small></span>
        </Link>
        <div className="admin-header-actions">
          {signedIn ? <SignOutButton /> : <Link className="admin-public-link" href="/">Vezi site-ul <span aria-hidden="true">↗</span></Link>}
        </div>
      </div>
      {signedIn && (
        <nav className="admin-nav" aria-label="Navigarea panoului">
          <Link href="/admin">Panou</Link>
          {CONTENT_KINDS.map((kind) => (
            <Link key={kind} href={`/admin/${CONTENT_META[kind].segment}`}>{CONTENT_META[kind].title}</Link>
          ))}
          <Link href="/admin/progress">Taskuri</Link>
        </nav>
      )}
    </header>
  )
}
