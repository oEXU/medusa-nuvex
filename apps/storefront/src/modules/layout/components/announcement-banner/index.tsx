"use client"

import { useEffect, useState } from "react"

const ROTATION_INTERVAL = 1300

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
        const isNext = index === (activeIndex + 1) % messages.length

        return (
          <div
            key={index}
            aria-hidden={!isActive}
            className="absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap px-2 will-change-transform small:gap-8 small:px-4"
            style={{
              transform: `translateX(${isActive ? 0 : isNext ? 100 : -100}%)`,
              transition: prefersReducedMotion
                ? "none"
                : "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
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
