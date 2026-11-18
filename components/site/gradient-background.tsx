"use client"

import { motion, useReducedMotion } from "framer-motion"

/**
 * Global background: neon "lava lamp" lights glowing on a deep black base, in the site palette —
 * Majorelle Blue #7B46F8, Hot Pink #FF66A9, Princeton Orange #FE8616, Lime Cream #D9FB5F.
 * Blobs are kept moderate in size and spread out so black stays visible between them; they are
 * blurred and screen-blended so overlaps add up like real light. Motion is slow drifting plus a
 * gentle wobble of shape (border-radius) and scale. Respects prefers-reduced-motion.
 */
type Blob = {
  color: string
  size: string
  top: string
  left: string
  opacity: number
  duration: number
  x: string[]
  y: string[]
}

const blobs: Blob[] = [
  { color: "#7b46f8", size: "40vmax", top: "-12%", left: "-10%", opacity: 0.7, duration: 34, x: ["0vw", "8vw", "-2vw", "4vw"], y: ["0vh", "10vh", "18vh", "4vh"] },
  { color: "#ff66a9", size: "34vmax", top: "8%", left: "62%", opacity: 0.62, duration: 29, x: ["0vw", "-10vw", "-4vw", "2vw"], y: ["0vh", "12vh", "-4vh", "6vh"] },
  { color: "#fe8616", size: "30vmax", top: "58%", left: "70%", opacity: 0.55, duration: 38, x: ["0vw", "-8vw", "-14vw", "-2vw"], y: ["0vh", "-10vh", "4vh", "-6vh"] },
  { color: "#d9fb5f", size: "22vmax", top: "68%", left: "6%", opacity: 0.45, duration: 42, x: ["0vw", "10vw", "4vw", "14vw"], y: ["0vh", "-12vh", "-20vh", "-6vh"] },
  { color: "#ff66a9", size: "24vmax", top: "40%", left: "30%", opacity: 0.4, duration: 46, x: ["0vw", "6vw", "14vw", "4vw"], y: ["0vh", "14vh", "2vh", "-8vh"] },
  { color: "#7b46f8", size: "20vmax", top: "18%", left: "36%", opacity: 0.5, duration: 40, x: ["0vw", "-6vw", "8vw", "2vw"], y: ["0vh", "-6vh", "10vh", "4vh"] },
]

// Lava-lamp wobble: the blob's outline slowly changes shape.
const wobble = [
  "42% 58% 63% 37% / 41% 44% 56% 59%",
  "58% 42% 38% 62% / 56% 61% 39% 44%",
  "47% 53% 58% 42% / 63% 38% 62% 37%",
  "42% 58% 63% 37% / 41% 44% 56% 59%",
]

export function GradientBackground() {
  const reduceMotion = useReducedMotion()

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050507]">
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute mix-blend-screen will-change-transform"
          style={{
            width: blob.size,
            height: blob.size,
            top: blob.top,
            left: blob.left,
            opacity: blob.opacity,
            borderRadius: wobble[0],
            filter: "blur(48px)",
            background: `radial-gradient(circle at 45% 45%, ${blob.color} 0%, ${blob.color}d9 32%, ${blob.color}00 70%)`,
          }}
          animate={reduceMotion ? undefined : { x: blob.x, y: blob.y, scale: [1, 1.14, 0.92, 1], borderRadius: wobble }}
          transition={{ duration: blob.duration, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
      ))}

      {/* Subtle vignette: darker edges keep text readable over the glow. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgb(0_0_0/55%)_100%)]" />
    </div>
  )
}
