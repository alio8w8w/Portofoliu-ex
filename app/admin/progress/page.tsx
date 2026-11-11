import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { ProgressManager } from "@/components/admin/progress-manager"
import { getOwnerSession } from "@/lib/content/auth"
import { getAdminTasks } from "@/lib/content/queries"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Taskuri și progres" }

export default async function AdminProgressPage() {
  const owner = await getOwnerSession()
  if (!owner) redirect("/admin/sign-in")
  const tasks = await getAdminTasks(owner.userId)
  return <ProgressManager tasks={tasks} />
}
