"use client"

import { motion, useReducedMotion } from "framer-motion"

/**
 * Full-site animated mesh gradient built from the "Electric Dreams" (#A500FF / #00FFFF / #FFFF00)
 * and "Neon Petal" (#EC2B7A / #FE7BBF / #CEFF32) palettes. Large soft blobs drift slowly over a
 * base gradient; a dot grid and film grain sit on top, like the reference posters.
 */
const blobs = [
  { color: "#a500ff", size: "78vmax", top: "-28%", left: "-22%", x: ["0%", "18%", "-6%"], y: ["0%", "12%", "-8%"], duration: 28 },
  { color: "#ec2b7a", size: "70vmax", top: "-18%", left: "38%", x: ["0%", "-16%", "8%"], y: ["0%", "16%", "4%"], duration: 32 },
  { color: "#ffe600", size: "64vmax", top: "48%", left: "52%", x: ["0%", "-20%", "6%"], y: ["0%", "-14%", "6%"], duration: 30 },
  { color: "#ceff32", size: "46vmax", top: "62%", left: "-12%", x: ["0%", "22%", "4%"], y: ["0%", "-18%", "-4%"], duration: 36 },
  { color: "#fe7bbf", size: "52vmax", top: "22%", left: "18%", x: ["0%", "14%", "-12%"], y: ["0%", "-10%", "14%"], duration: 24 },
  { color: "#00ffff", size: "26vmax", top: "30%", left: "70%", x: ["0%", "-30%", "-10%"], y: ["0%", "20%", "-12%"], duration: 40 },
]

const grain = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function GradientBackground() {
  const reduceMotion = useReducedMotion()

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[linear-gradient(140deg,#fe7bbf_0%,#a500ff_38%,#ec2b7a_64%,#ffd400_100%)]">
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
      {/* Halftone dot grid from the "Electric Dreams" poster. */}
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgb(255_255_255/55%)_0.8px,transparent_0.9px)] [background-size:7px_7px]" />
      {/* Film grain. */}
      <div className="absolute inset-0 opacity-[0.22] mix-blend-overlay" style={{ backgroundImage: grain }} />
    </div>
  )
}
