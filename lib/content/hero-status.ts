import { getPublicEntries, getPublicTasks } from "@/lib/content/queries"
import { CONTENT_META, type HeroSlotData } from "@/lib/content/types"

/** How long a vlog or task counts as "new" for the hero slot machine. */
const NEW_WINDOW_DAYS = 14

const nothingNew: HeroSlotData = { status: "nothing new", vlog: null, newTaskCount: 0 }

export async function getHeroSlotData(now = Date.now()): Promise<HeroSlotData> {
  const cutoff = now - NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000

  try {
    const [vlogs, tasks] = await Promise.all([getPublicEntries("vlog"), getPublicTasks()])

    const latestVlog = vlogs
      .filter((vlog) => vlog.publishedAt)
      .sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!))[0]

    if (latestVlog && Date.parse(latestVlog.publishedAt!) >= cutoff) {
      return {
        status: "new vlog",
        vlog: {
          title: latestVlog.title,
          href: `/${CONTENT_META.vlog.segment}/${latestVlog.slug}`,
          coverUrl: latestVlog.coverUrl,
          coverAlt: latestVlog.coverAlt,
        },
        newTaskCount: 0,
      }
    }

    const newTaskCount = tasks.filter((task) => Date.parse(task.createdAt) >= cutoff).length
    if (newTaskCount > 0) return { status: "new tasks", vlog: null, newTaskCount }
  } catch (error) {
    // The hero must render even when the database is unreachable (e.g. local dev without env vars).
    console.error("[hero-status] falling back to 'nothing new':", error)
  }

  return nothingNew
}
