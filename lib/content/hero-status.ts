import { getLatestPublicPost } from "@/lib/content/queries"
import { CONTENT_META, type HeroSlotData } from "@/lib/content/types"

/** A post counts as "news" for the slot machine for this long after it is published. */
const NEWS_WINDOW_HOURS = 24

export async function getHeroSlotData(now = Date.now()): Promise<HeroSlotData> {
  // No database configured (e.g. local dev without .env): don't even try to connect.
  if (!process.env.DATABASE_URL) return { latestPost: null }

  try {
    const post = await getLatestPublicPost(new Date(now - NEWS_WINDOW_HOURS * 60 * 60 * 1000))
    if (post) {
      return {
        latestPost: { title: post.title, href: `/${CONTENT_META[post.kind].segment}/${post.slug}`, kind: post.kind },
      }
    }
  } catch (error) {
    // Log only the message: passing an AggregateError object to console.error crashes Next's dev logger.
    const message = error instanceof Error ? error.message.split("\n")[0] : String(error)
    console.warn(`[hero-status] no news data: ${message}`)
  }

  return { latestPost: null }
}
