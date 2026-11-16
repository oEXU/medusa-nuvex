"use client"

import { useEffect, useState } from "react"

const headlinesByCountry = {
  br: [
    { text: "Seu inventário de possibilidades.", whiteWords: 2 },
    { text: "Equipamentos para elevar sua gameplay.", whiteWords: 1 },
    { text: "Tudo para quem vive esse universo.", whiteWords: 2 },
    { text: "Sua próxima fase começa aqui.", whiteWords: 2 },
  ],
  us: [
    { text: "Your inventory of possibilities.", whiteWords: 2 },
    { text: "Gear to level up your gameplay.", whiteWords: 1 },
    { text: "Everything for those who live this universe.", whiteWords: 2 },
    { text: "Your next level starts here.", whiteWords: 2 },
  ],
}

export default function RotatingHeadline({
  countryCode,
}: {
  countryCode: string
}) {
  const headlines =
    countryCode.toLowerCase() === "us"
      ? headlinesByCountry.us
      : headlinesByCountry.br
  const [headlineIndex, setHeadlineIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState(headlines[0].text)
  const [isDeleting, setIsDeleting] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)

    updatePreference()
    mediaQuery.addEventListener("change", updatePreference)
    return () => mediaQuery.removeEventListener("change", updatePreference)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      return
    }

    const currentHeadline = headlines[headlineIndex].text
    const isComplete = !isDeleting && displayedText === currentHeadline

    const timeout = setTimeout(
      () => {
        if (isComplete) {
          setIsDeleting(true)
          return
        }

        if (isDeleting && displayedText.length === 1) {
          setDisplayedText("")
          setIsDeleting(false)
          setHeadlineIndex((current) => (current + 1) % headlines.length)
          return
        }

        setDisplayedText(
          isDeleting
            ? displayedText.slice(0, -1)
            : currentHeadline.slice(0, displayedText.length + 1),
        )
      },
      isComplete ? 1800 : isDeleting ? 40 : 75,
    )

    return () => clearTimeout(timeout)
  }, [displayedText, headlineIndex, headlines, isDeleting, prefersReducedMotion])

  const words = displayedText.split(" ")
  const whiteWords = headlines[headlineIndex].whiteWords
  const firstPart = words.slice(0, whiteWords).join(" ")
  const secondPart = words.slice(whiteWords).join(" ")

  return (
    <h1 className="min-h-[2.1em] max-w-[18ch] text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.05em] small:text-6xl">
      <span className="sr-only">{headlines[0].text}</span>
      <span aria-hidden="true">
        {firstPart}
        <span className="bg-gradient-to-r from-pink-300 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
          {secondPart ? ` ${secondPart}` : ""}
        </span>
        <span className="ml-1 inline-block animate-pulse text-fuchsia-300">|</span>
      </span>
    </h1>
  )
}
