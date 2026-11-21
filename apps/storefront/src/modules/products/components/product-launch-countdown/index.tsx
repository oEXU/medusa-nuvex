"use client"

import { useEffect, useState } from "react"

import {
  GAME_LAUNCH_AT,
  GAME_LAUNCH_DATE_LABEL,
  getCountdownRemaining,
  type CountdownRemaining,
} from "@lib/data/mock-launch"
import { translate } from "@lib/util/store-locale"

const unitClass = "flex flex-col items-center gap-y-1"
const valueClass = "text-xl-semi tabular-nums text-pink-300"
const labelClass =
  "text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400"

export default function ProductLaunchCountdown({
  countryCode,
}: {
  countryCode: string
}) {
  const [remaining, setRemaining] = useState<CountdownRemaining | null>(null)

  useEffect(() => {
    const target = new Date(GAME_LAUNCH_AT).getTime()
    const update = () => setRemaining(getCountdownRemaining(Date.now(), target))

    update()
    const timer = window.setInterval(update, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const units = [
    { key: "days", label: translate(countryCode, "launchCountdownDays") },
    { key: "hours", label: translate(countryCode, "launchCountdownHours") },
    { key: "minutes", label: translate(countryCode, "launchCountdownMinutes") },
    { key: "seconds", label: translate(countryCode, "launchCountdownSeconds") },
  ] as const

  const isPast =
    remaining !== null &&
    remaining.days === 0 &&
    remaining.hours === 0 &&
    remaining.minutes === 0 &&
    remaining.seconds === 0

  return (
    <div
      className="rounded-2xl border border-fuchsia-300/20 bg-[#100c20] p-5 shadow-sm"
      data-testid="product-launch-countdown"
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">
        {isPast
          ? translate(countryCode, "launchCountdownAvailable")
          : translate(countryCode, "launchCountdownTitle")}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">
        {GAME_LAUNCH_DATE_LABEL} · 00:00
      </p>

      {!isPast && (
        <div className="mt-4 grid grid-cols-4 gap-x-2 border-t border-white/10 pt-4">
          {units.map((unit) => (
            <div key={unit.key} className={unitClass}>
              <span className={valueClass}>
                {remaining
                  ? String(remaining[unit.key]).padStart(2, "0")
                  : "--"}
              </span>
              <span className={labelClass}>{unit.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}