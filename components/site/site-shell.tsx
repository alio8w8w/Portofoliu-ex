"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { LanguageProvider } from "@/components/portfolio/language-context"
import { AudioPlayer } from "./audio-player"
import { FolderNav } from "./folder-nav"
import { GradientBackground } from "./gradient-background"

/**
 * Persistent chrome for the public site. Mounted once in the root layout, so the
 * background, navbar and (most importantly) the audio player survive client-side navigation.
 * The admin area keeps its own plain layout.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith("/admin")) return <>{children}</>

  return (
    <LanguageProvider>
      <GradientBackground />
      <FolderNav />
      {children}
      <AudioPlayer />
    </LanguageProvider>
  )
}
