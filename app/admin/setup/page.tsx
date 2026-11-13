import { redirect } from "next/navigation"

// There is no sign-up any more: the single admin account is configured in lib/auth/config.ts.
export default function AdminSetupPage() {
  redirect("/admin/sign-in")
}
