"use client"

import Script from "next/script"
import { useEffect } from "react"

type BlackcatOriginWindow = Window & {
  __blackcatOriginScriptState?: "ready" | "error"
}

export default function BlackcatOriginScript({ src }: { src?: string }) {
  useEffect(() => {
    if (!src) {
      ;(window as BlackcatOriginWindow).__blackcatOriginScriptState = "error"
    }
  }, [src])

  if (!src) {
    return null
  }

  return (
    <Script
      src={src}
      strategy="afterInteractive"
      onReady={() => {
        ;(window as BlackcatOriginWindow).__blackcatOriginScriptState = "ready"
      }}
      onError={() => {
        ;(window as BlackcatOriginWindow).__blackcatOriginScriptState = "error"
      }}
    />
  )
}
