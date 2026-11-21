"use client"

import { useEffect, useState } from "react"

import { getCategoryLabel } from "@lib/util/store-locale"
import {
  notifyCategorySelected,
  subscribeToCategorySelected,
} from "@lib/util/category-events"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import { storeCategories, StoreCategoryIcon } from "../store-categories"

export default function NavCategories({ countryCode }: { countryCode: string }) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  useEffect(() => {
    const syncFromHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace("#", ""))

      setActiveCategoryId(hash || null)
    }

    syncFromHash()
    window.addEventListener("hashchange", syncFromHash)
    window.addEventListener("popstate", syncFromHash)

    const unsubscribe = subscribeToCategorySelected((categoryId) =>
      setActiveCategoryId(categoryId),
    )

    return () => {
      window.removeEventListener("hashchange", syncFromHash)
      window.removeEventListener("popstate", syncFromHash)
      unsubscribe()
    }
  }, [])

  return (
    <>
      {storeCategories.map((category) => {
        const isSelected = activeCategoryId === category.id

        return (
          <div
            key={category.id}
            className={clx(
              "flex h-full items-center rounded-t-lg border border-b-0 transition-colors",
              isSelected ? "border-pink-400" : "border-transparent",
            )}
          >
            <LocalizedClientLink
              href={isSelected ? "/" : `/#${category.id}`}
              onClick={() => {
                if (isSelected) {
                  setActiveCategoryId(null)
                  notifyCategorySelected(null)
                  return
                }

                setActiveCategoryId(category.id)
                notifyCategorySelected(category.id)
              }}
              aria-current={isSelected ? "true" : undefined}
              className={clx(
                "group flex h-full w-full items-center gap-2 px-2.5 text-[11px] font-bold uppercase tracking-wide transition small:text-xs",
                isSelected ? "text-pink-200" : "text-white/90 hover:text-pink-200",
              )}
            >
              <StoreCategoryIcon
                name={category.icon}
                className={clx(
                  "h-6 w-7 shrink-0 transition",
                  isSelected
                    ? "text-pink-200 drop-shadow-[0_0_6px_rgba(244,114,182,0.65)]"
                    : "text-white group-hover:text-pink-200",
                )}
              />
              {getCategoryLabel(countryCode, category.id)}
            </LocalizedClientLink>
          </div>
        )
      })}
    </>
  )
}