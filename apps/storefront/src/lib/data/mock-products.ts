import type { HttpTypes } from "@medusajs/types"

export type MockPrice = {
  brl: number
  usd: number
}

export type MockProductSpec = {
  handle: string
  title: string
  subtitle?: string
  description: string
  /** Image path under `public/`. Omit to render a placeholder box. */
  image?: string
  /** Background color of the placeholder box when `image` is omitted. */
  imagePlaceholderColor?: string
  variantTitle?: string
  sku?: string
  price: MockPrice
  originalPrice?: MockPrice
  /** Set to `false` to render the variant as "Indisponível no momento". */
  available?: boolean
  /** Optional badge rendered over the product card in the listing. */
  listingBadge?: string
  /** Platform categories (`categoria-ps5`, `categoria-xbox`, ...) that list it. */
  categoryKeys?: string[]
  /** Image to use when the game is listed inside a given category. */
  imageByCategory?: Record<string, string>
}

export const GTA_VI_ULTIMATE_EDITION_PRIMARY_HANDLE =
  "grand-theft-auto-vi-ultimate-edition-primaria"
export const GTA_VI_ULTIMATE_EDITION_SECONDARY_HANDLE =
  "grand-theft-auto-vi-ultimate-edition-secundaria"
export const RED_DEAD_REDEMPTION_2_HANDLE = "red-dead-redemption-2"

/**
 * Products that don't exist in Medusa yet but should still render on the
 * storefront. Add an entry here and the product detail page (and its `.md`
 * variant) will work through `getMockProduct`.
 */
const GTA_VI_ULTIMATE_EDITION_PRIMARY_SPEC: MockProductSpec = {
  handle: GTA_VI_ULTIMATE_EDITION_PRIMARY_HANDLE,
  title: "Grand Theft Auto VI Ultimate Edition - Primária",
  subtitle: "PlayStation 5",
  description:
    "Grand Theft Auto VI Ultimate Edition na versão primária, com o jogo base e conteúdos extras para PlayStation 5.",
  image: "/gta-vi-aura.png",
  variantTitle: "PS5",
  sku: "GTAVI-ULTIMATE-PRIMARIA-PS5",
  price: { brl: 30990, usd: 5999 },
  originalPrice: { brl: 37188, usd: 7199 },
  listingBadge: "MAIS VENDIDO",
  categoryKeys: ["categoria-ps5", "categoria-xbox"],
}

const GTA_VI_ULTIMATE_EDITION_SECONDARY_SPEC: MockProductSpec = {
  handle: GTA_VI_ULTIMATE_EDITION_SECONDARY_HANDLE,
  title: "Grand Theft Auto VI Ultimate Edition - Secundária",
  subtitle: "PlayStation 5",
  description:
    "Grand Theft Auto VI Ultimate Edition na versão secundária, com o jogo base e conteúdos extras para PlayStation 5.",
  image: "/gta-vi-aura.png",
  variantTitle: "PS5",
  sku: "GTAVI-ULTIMATE-SECUNDARIA-PS5",
  price: { brl: 25999, usd: 5999 },
  originalPrice: { brl: 31199, usd: 7199 },
  categoryKeys: ["categoria-ps5", "categoria-xbox"],
}

const RED_DEAD_REDEMPTION_2_SPEC: MockProductSpec = {
  handle: RED_DEAD_REDEMPTION_2_HANDLE,
  title: "Red Dead Redemption 2",
  subtitle: "PlayStation 5",
  description:
    "Red Dead Redemption 2 acompanha Arthur Morgan no crepúsculo do Velho Oeste, em um vasto mundo aberto com história épica e detalhes impressionantes para PlayStation 5.",
  image: "/red-dead-redemption-2.webp",
  imageByCategory: {
    "categoria-ps5": "/red-dead-redemption-2.webp",
    "categoria-xbox": "/red-dead-redemption-2-xbox.webp",
  },
  variantTitle: "PS5",
  sku: "RDR2-PS5",
  price: { brl: 24990, usd: 4999 },
  available: false,
  categoryKeys: ["categoria-ps5", "categoria-xbox"],
}

const FC_2026_SPEC: MockProductSpec = {
  handle: "fc-2026",
  title: "FC 2026",
  subtitle: "PlayStation 5",
  description:
    "FC 2026 traz o futebol mais realista da temporada, com novos modos de jogo e gráficos para PlayStation 5.",
  image: "/fc-2026.webp",
  variantTitle: "PS5",
  sku: "FC26-PS5",
  price: { brl: 22090, usd: 4299 },
  categoryKeys: ["categoria-ps5"],
}

const THE_LAST_OF_US_PART_II_SPEC: MockProductSpec = {
  handle: "the-last-of-us-part-ii",
  title: "The Last Of Us II",
  subtitle: "PlayStation 5",
  description:
    "The Last of Us Part II acompanha Ellie em uma jornada intensa de sobrevivência e vingança para PlayStation 5.",
  image: "/the-last-of-us-part-ii.webp",
  variantTitle: "PS5",
  sku: "TLOU2-PS5",
  price: { brl: 13000, usd: 2999 },
  categoryKeys: ["categoria-ps5"],
}

const ASSASSINS_CREED_VALHALLA_SPEC: MockProductSpec = {
  handle: "assassins-creed-valhalla",
  title: "Assassin's Creed Valhalla",
  subtitle: "Xbox",
  description:
    "Assassin's Creed Valhalla leva você à era viking em um mundo aberto de exploração e combate para Xbox.",
  image: "/assassins-creed-valhalla.webp",
  variantTitle: "Xbox",
  sku: "ACV-XBOX",
  price: { brl: 14900, usd: 3499 },
  categoryKeys: ["categoria-xbox"],
}

export const MOCK_PRODUCTS: MockProductSpec[] = [
  GTA_VI_ULTIMATE_EDITION_SECONDARY_SPEC,
  GTA_VI_ULTIMATE_EDITION_PRIMARY_SPEC,
  FC_2026_SPEC,
  THE_LAST_OF_US_PART_II_SPEC,
  ASSASSINS_CREED_VALHALLA_SPEC,
  RED_DEAD_REDEMPTION_2_SPEC,
]

const mockId = (handle: string) => `mock-${handle}`

const getDiscountPercent = (handle: string) => {
  let hash = 0

  for (const character of handle) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }

  return 27 + (hash % 41)
}

const getDiscountedPrice = (amount: number, discountPercent: number) =>
  Math.round((amount * (100 - discountPercent)) / 100)

function buildMockProduct(
  spec: MockProductSpec,
  region?: HttpTypes.StoreRegion | null
): HttpTypes.StoreProduct {
  const priceKey =
    region?.currency_code?.toLowerCase() === "usd" ? "usd" : "brl"
  const currencyCode = priceKey.toUpperCase()
  // Specs store integer cents; Medusa exposes `calculated_amount` in major units.
  const discountPercent = getDiscountPercent(spec.handle)
  const originalPrice = spec.originalPrice?.[priceKey] ?? spec.price[priceKey]
  const calculatedPrice = spec.originalPrice
    ? getDiscountedPrice(originalPrice, discountPercent)
    : getDiscountedPrice(spec.price[priceKey], discountPercent)
  const calculatedAmount = calculatedPrice / 100
  const originalAmount = originalPrice / 100
  const productId = mockId(spec.handle)
  const variantId = `${productId}-variant`

  return {
    id: productId,
    title: spec.title,
    subtitle: spec.subtitle,
    handle: spec.handle,
    description: spec.description,
    thumbnail: spec.image,
    images: spec.image
      ? [{ id: `${productId}-image`, url: spec.image, rank: 0 }]
      : [],
    options: [],
    variants: [
      {
        id: variantId,
        title: spec.variantTitle ?? "Default",
        sku: spec.sku,
        manage_inventory: spec.available === false,
        allow_backorder: false,
        inventory_quantity: spec.available === false ? 0 : 999,
        options: [],
        images: [],
        calculated_price: {
          id: `${variantId}-price`,
          calculated_amount: calculatedAmount,
          original_amount: originalAmount,
          currency_code: currencyCode,
          calculated_price: {
            id: `${variantId}-price-item`,
            price_list_id: `${productId}-price-list`,
            price_list_type: "sale",
            min_quantity: null,
            max_quantity: null,
          },
        },
      },
    ],
    metadata: {
      mock: true,
      imagePlaceholderColor: spec.imagePlaceholderColor,
      listingBadge: spec.listingBadge,
      categoryKeys: spec.categoryKeys,
      imageByCategory: spec.imageByCategory,
    },
  } as unknown as HttpTypes.StoreProduct
}

export function getMockProduct(
  handle: string,
  region?: HttpTypes.StoreRegion | null
): HttpTypes.StoreProduct | undefined {
  const spec = MOCK_PRODUCTS.find((product) => product.handle === handle)
  return spec ? buildMockProduct(spec, region) : undefined
}

/** GTA VI products first, in edition order, then original storefront order. */
function sortMockProducts(specs: MockProductSpec[]) {
  const gtaViOrder: Record<string, number> = {
    [GTA_VI_ULTIMATE_EDITION_PRIMARY_HANDLE]: 0,
    [GTA_VI_ULTIMATE_EDITION_SECONDARY_HANDLE]: 1,
  }

  return [...specs].sort((first, second) => {
    const firstGtaOrder = gtaViOrder[first.handle]
    const secondGtaOrder = gtaViOrder[second.handle]
    const firstIsGta = firstGtaOrder !== undefined
    const secondIsGta = secondGtaOrder !== undefined

    if (firstIsGta || secondIsGta) {
      if (!firstIsGta) return 1
      if (!secondIsGta) return -1
      return firstGtaOrder - secondGtaOrder
    }

    const badgeOrder =
      Number(Boolean(second.listingBadge)) -
      Number(Boolean(first.listingBadge))

    if (badgeOrder !== 0) {
      return badgeOrder
    }

    return Number(first.available === false) - Number(second.available === false)
  })
}

export function getMockProducts(
  region?: HttpTypes.StoreRegion | null
): HttpTypes.StoreProduct[] {
  return sortMockProducts(MOCK_PRODUCTS).map((spec) =>
    buildMockProduct(spec, region)
  )
}

export function getMockProductsByCategory(
  categoryKey: string,
  region?: HttpTypes.StoreRegion | null
): HttpTypes.StoreProduct[] {
  return sortMockProducts(
    MOCK_PRODUCTS.filter((spec) => spec.categoryKeys?.includes(categoryKey))
  ).map((spec) => buildMockProduct(spec, region))
}
