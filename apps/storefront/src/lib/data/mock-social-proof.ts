export type SocialProofStats = {
  sales: number
  cartAdds: number
}

type SocialProofSeed = SocialProofStats & {
  intervalHours: number
  salesPerInterval: number
  cartAddsPerInterval: number
}

/**
 * Counters were captured at 17/11/2026 13:35 (America/Sao_Paulo) and grow
 * from there on every interval below.
 */
export const SOCIAL_PROOF_STARTED_AT = "2026-11-17T13:35:09-03:00"

const HOUR_IN_MS = 60 * 60 * 1000

const socialProofSeeds: Record<string, SocialProofSeed> = {
  "grand-theft-auto-vi-ultimate-edition-primaria": {
    sales: 456,
    cartAdds: 678,
    intervalHours: 3,
    salesPerInterval: 1,
    cartAddsPerInterval: 2,
  },
  "grand-theft-auto-vi-ultimate-edition-secundaria": {
    sales: 368,
    cartAdds: 577,
    intervalHours: 4,
    salesPerInterval: 1,
    cartAddsPerInterval: 2,
  },
}

export function getSocialProof(
  handle: string | null | undefined,
  now: number = Date.now()
): SocialProofStats | null {
  if (!handle) {
    return null
  }

  const seed = socialProofSeeds[handle]

  if (!seed) {
    return null
  }

  const elapsed = Math.max(
    0,
    now - new Date(SOCIAL_PROOF_STARTED_AT).getTime()
  )
  const intervals = Math.floor(elapsed / (seed.intervalHours * HOUR_IN_MS))

  return {
    sales: seed.sales + intervals * seed.salesPerInterval,
    cartAdds: seed.cartAdds + intervals * seed.cartAddsPerInterval,
  }
}