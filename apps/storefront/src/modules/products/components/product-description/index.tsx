"use client"

import { useEffect, useRef, useState } from "react"
import { Text } from "@modules/common/components/ui"
import ChevronDown from "@modules/common/icons/chevron-down"
import { clsx } from "clsx"
import { DESCRIPTION_LINE_LIMIT } from "./constants"

type ProductDescriptionProps = {
  description?: string | null
}

export default function ProductDescription({
  description,
}: ProductDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [canExpand, setCanExpand] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = textRef.current
    if (!el) {
      return
    }

    const checkOverflow = () => {
      const computed = window.getComputedStyle(el)
      const lineHeight = parseFloat(computed.lineHeight) || 24
      const maxHeight = lineHeight * DESCRIPTION_LINE_LIMIT

      // If the content is truncated when clamped or exceeds the 13 lines height:
      const isOverflowing =
        el.scrollHeight > el.clientHeight + 2 || el.scrollHeight > maxHeight + 2

      setCanExpand(isOverflowing)
    }

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        checkOverflow()
      })
      resizeObserver.observe(el)
    }

    const handleResize = () => {
      checkOverflow()
    }

    window.addEventListener("resize", handleResize)

    const rafId = requestAnimationFrame(checkOverflow)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", handleResize)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [description])

  if (!description) {
    return null
  }

  return (
    <div className="flex flex-col items-start gap-y-2">
      <Text
        ref={textRef}
        id="product-description"
        data-testid="product-description"
        className={clsx(
          "max-w-prose whitespace-pre-line text-sm leading-6 text-slate-600",
          !isExpanded && "line-clamp-[13]",
        )}
        style={
          !isExpanded
            ? {
                display: "-webkit-box",
                WebkitLineClamp: DESCRIPTION_LINE_LIMIT,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {description}
      </Text>

      {canExpand && (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          aria-controls="product-description"
          data-testid="read-more-button"
          className="inline-flex items-center gap-x-1 text-sm font-semibold text-fuchsia-700 hover:text-fuchsia-800 transition-colors focus:outline-none focus-visible:underline"
        >
          <span>{isExpanded ? "Leia menos" : "Leia mais"}</span>
          <ChevronDown
            size="14"
            className={clsx(
              "transition-transform duration-200",
              isExpanded && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  )
}
