import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/admin/auth-form"
import { getOwnerSession } from "@/lib/content/auth"

export const metadata: Metadata = { title: "Autentificare admin" }

export default async function AdminSignInPage() {
  if (await getOwnerSession()) redirect("/admin")
  return <AuthForm mode="sign-in" />
}
