import { PortfolioSite } from "@/components/portfolio/portfolio-site"
import { getHeroSlotData } from "@/lib/content/hero-status"

// Re-check for new vlogs/tasks every 5 minutes.
export const revalidate = 300

export default async function Page() {
  const slot = await getHeroSlotData()
  return <PortfolioSite slot={slot} />
}
