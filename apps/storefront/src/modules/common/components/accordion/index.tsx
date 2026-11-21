"use client"

import { useId, useState } from "react"

export type AccordionItem = {
  id: string
  title: string
  content: string
}

type AccordionProps = {
  items: AccordionItem[]
  className?: string
}

export default function Accordion({ items, className = "" }: AccordionProps) {
  const [openItemId, setOpenItemId] = useState<string | null>(null)
  const accordionId = useId()

  return (
    <div
      className={`divide-y divide-white/10 border-y border-white/10 ${className}`}
    >
      {items.map((item) => {
        const isOpen = openItemId === item.id
        const triggerId = `${accordionId}-trigger-${item.id}`
        const panelId = `${accordionId}-panel-${item.id}`

        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenItemId(isOpen ? null : item.id)}
                className="group flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-sm font-semibold text-white transition-colors group-hover:text-pink-200 small:text-base">
                  {item.title}
                </span>
                <span
                  aria-hidden="true"
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    isOpen
                      ? "rotate-45 border-pink-300/50 bg-pink-500/20 text-pink-200"
                      : "border-white/15 bg-white/[0.04] text-slate-300 group-hover:border-pink-300/30 group-hover:text-pink-200"
                  }`}
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                    <path
                      d="M10 4v12M4 10h12"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
              className="pb-6 pr-12"
            >
              <p className="max-w-3xl whitespace-pre-line text-sm leading-6 text-slate-300/80">
                {item.content}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}