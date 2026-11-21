"use client"

import { useEffect, useState } from "react"

import {
  getSocialProof,
  type SocialProofStats,
} from "@lib/data/mock-social-proof"
import { getStoreLanguage, translate } from "@lib/util/store-locale"

const REFRESH_INTERVAL_MS = 60 * 1000

function PeopleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20v-1.2A4.8 4.8 0 0 1 7.8 14h2.4a4.8 4.8 0 0 1 4.8 4.8V20" />
      <path d="M16 5.4a3.2 3.2 0 0 1 0 5.2M17.4 14a4.8 4.8 0 0 1 3.6 4.8V20" />
    </svg>
  )
}

function CartIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 4h2l2.3 10.2a1.2 1.2 0 0 0 1.2 1H18" />
      <path d="M6.4 7.4H21l-1.8 6.1a1.2 1.2 0 0 1-1.2.9H7.6" />
      <circle cx="9.5" cy="19" r="1.4" />
      <circle cx="17" cy="19" r="1.4" />
    </svg>
  )
}

export default function ProductSocialProof({
  handle,
  countryCode,
  initialStats,
}: {
  handle: string | null | undefined
  countryCode: string
  initialStats: SocialProofStats | null
}) {
  const [stats, setStats] = useState<SocialProofStats | null>(initialStats)

  useEffect(() => {
    const update = () => setStats(getSocialProof(handle))

    update()
    const timer = window.setInterval(update, REFRESH_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [handle])

  if (!stats) {
    return null
  }

  const numberFormat = new Intl.NumberFormat(getStoreLanguage(countryCode))

  return (
    <div
      className="flex flex-col gap-y-2 text-lg text-ui-fg-subtle"
      data-testid="product-social-proof"
    >
      <span className="inline-flex items-center gap-x-2">
        <PeopleIcon className="h-6 w-6 shrink-0 text-fuchsia-700" />
        <span>
          <span className="font-semibold text-ui-fg-base">
            {numberFormat.format(stats.sales)}
          </span>{" "}
          {translate(countryCode, "socialProofSales")}{" "}
          <span aria-hidden="true">🔥🔥</span>
        </span>
      </span>
      <span className="inline-flex items-center gap-x-2">
        <CartIcon className="h-6 w-6 shrink-0 text-fuchsia-700" />
        <span>
          <span className="font-semibold text-ui-fg-base">
            {numberFormat.format(stats.cartAdds)}
          </span>{" "}
          {translate(countryCode, "socialProofCartAdds")}{" "}
          <span aria-hidden="true">❤️❤️</span>
        </span>
      </span>
    </div>
  )
}