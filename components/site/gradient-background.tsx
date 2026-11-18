"use client"

import { motion, useReducedMotion } from "framer-motion"

/**
 * Full-site animated mesh gradient in the site palette: Lime Cream #D9FB5F, Hot Pink #FF66A9,
 * Princeton Orange #FE8616 and Majorelle Blue #7B46F8. Large soft blobs drift slowly over a
 * base gradient.
 */
const blobs = [
  { color: "#7b46f8", size: "78vmax", top: "-28%", left: "-22%", x: ["0%", "18%", "-6%"], y: ["0%", "12%", "-8%"], duration: 28 },
  { color: "#ff66a9", size: "70vmax", top: "-18%", left: "38%", x: ["0%", "-16%", "8%"], y: ["0%", "16%", "4%"], duration: 32 },
  { color: "#fe8616", size: "64vmax", top: "48%", left: "52%", x: ["0%", "-20%", "6%"], y: ["0%", "-14%", "6%"], duration: 30 },
  { color: "#d9fb5f", size: "46vmax", top: "62%", left: "-12%", x: ["0%", "22%", "4%"], y: ["0%", "-18%", "-4%"], duration: 36 },
  { color: "#ff8fc0", size: "52vmax", top: "22%", left: "18%", x: ["0%", "14%", "-12%"], y: ["0%", "-10%", "14%"], duration: 24 },
  { color: "#a07dfa", size: "26vmax", top: "30%", left: "70%", x: ["0%", "-30%", "-10%"], y: ["0%", "20%", "-12%"], duration: 40 },
]

export function GradientBackground() {
  const reduceMotion = useReducedMotion()

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[linear-gradient(140deg,#ff66a9_0%,#7b46f8_38%,#ff66a9_64%,#fe8616_100%)]">
      {blobs.map((blob) => (
        <motion.div
          key={blob.color}
          className="absolute rounded-full will-change-transform"
          style={{
            width: blob.size,
            height: blob.size,
            top: blob.top,
            left: blob.left,
            background: `radial-gradient(circle at center, ${blob.color} 0%, ${blob.color}cc 22%, transparent 66%)`,
          }}
          animate={reduceMotion ? undefined : { x: blob.x, y: blob.y, scale: [1, 1.12, 0.94], rotate: [0, 25, -10] }}
          transition={{ duration: blob.duration, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
      ))}

      {/* Soft cream veil keeps body text readable without dulling the neon. */}
      <div className="absolute inset-0 bg-[#fffaf1]/20" />
    </div>
  )
}
