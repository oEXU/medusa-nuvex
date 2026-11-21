export const GAME_LAUNCH_AT = "2026-11-19T00:00:00-03:00"

export const GAME_LAUNCH_DATE_LABEL = "19/11/2026"

const launchProductHandles = new Set([
  "grand-theft-auto-vi-ultimate-edition-primaria",
  "grand-theft-auto-vi-ultimate-edition-secundaria",
])

export function isLaunchProduct(handle: string | null | undefined) {
  return Boolean(handle && launchProductHandles.has(handle))
}

export type CountdownRemaining = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function getCountdownRemaining(
  now: number = Date.now(),
  target: number = new Date(GAME_LAUNCH_AT).getTime()
): CountdownRemaining {
  const diff = Math.max(0, target - now)

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}