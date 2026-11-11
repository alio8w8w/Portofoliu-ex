import type { ReactNode } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { getOwnerSession } from "@/lib/content/auth"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const owner = await getOwnerSession()

  return (
    <div className="admin-app">
      <AdminHeader signedIn={Boolean(owner)} />
      {children}
    </div>
  )
}
