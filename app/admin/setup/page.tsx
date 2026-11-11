import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/admin/auth-form"
import { getOwnerSession } from "@/lib/content/auth"

export const metadata: Metadata = { title: "Configurare cont owner" }

export default async function AdminSetupPage() {
  if (await getOwnerSession()) redirect("/admin")
  return <AuthForm mode="setup" />
}
