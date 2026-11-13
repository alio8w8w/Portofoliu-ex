"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut as signOutAction } from "@/lib/auth/actions"

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function signOut() {
    setPending(true)
    await signOutAction()
    router.replace("/admin/sign-in")
    router.refresh()
  }

  return (
    <button className="admin-signout" type="button" disabled={pending} onClick={signOut}>
      {pending ? "Se deconectează…" : "Deconectare"}
    </button>
  )
}
