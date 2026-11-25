"use client"

import { useEffect, useState } from "react"

const ROTATION_INTERVAL = 5000

export default function AnnouncementBanner({
  label,
  messages,
}: {
  label: string
  messages: string[]
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)

    updatePreference()
    mediaQuery.addEventListener("change", updatePreference)
    return () => mediaQuery.removeEventListener("change", updatePreference)
  }, [])

  useEffect(() => {
    if (messages.length < 2) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % messages.length)
    }, ROTATION_INTERVAL)

    return () => window.clearInterval(timer)
  }, [messages.length])

  if (!messages.length) {
    return null
  }

  return (
    <div
      role="region"
      aria-label={label}
      aria-live="off"
      className="relative h-10 overflow-hidden bg-[#21102f] text-[10px] font-extrabold uppercase tracking-[0.08em] text-pink-100 small:h-11 small:text-xs"
    >
      {messages.map((message, index) => {
        const isActive = index === activeIndex

        return (
          <div
            key={index}
            aria-hidden={!isActive}
            className="absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap px-2 will-change-[opacity,transform] small:gap-6 small:px-4"
            style={{
              opacity: isActive ? 1 : 0,
              transform: `translateY(${isActive ? 0 : 6}px)`,
              transition: prefersReducedMotion
                ? "none"
                : "opacity 600ms ease, transform 600ms ease",
            }}
          >
            <span className="hidden rounded bg-pink-400 px-2 py-1 text-[9px] font-black text-[#21102f] small:inline-flex small:text-[10px]">
              NuveX Games
            </span>
            <span>{message}</span>
            <span className="text-white/55" aria-hidden="true">
              ◆
            </span>
          </div>
        )
      })}
    </div>
  )
}
