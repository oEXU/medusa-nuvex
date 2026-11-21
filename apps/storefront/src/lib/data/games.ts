import type { HttpTypes } from "@medusajs/types"

import { listFeaturedProductPlacements } from "./featured-products"
import { getMockProducts } from "./mock-products"
import { listProducts } from "./products"

/**
 * Game catalog shown across the storefront: games featured in the backend
 * first (ordered by `sort_order`), then the mock games that don't exist in
 * Medusa yet.
 */
export async function listGames({
  region,
  excludeIds = [],
  excludeHandles = [],
}: {
  region: HttpTypes.StoreRegion
  excludeIds?: string[]
  excludeHandles?: string[]
}): Promise<HttpTypes.StoreProduct[]> {
  const placements = await listFeaturedProductPlacements()
  const productIds = Array.from(
    new Set(placements.map(({ product_id }) => product_id))
  )

  const {
    response: { products },
  } = productIds.length
    ? await listProducts({
        regionId: region.id,
        queryParams: { id: productIds, limit: productIds.length },
      })
    : { response: { products: [] as HttpTypes.StoreProduct[] } }

  const productsById = new Map(products.map((product) => [product.id, product]))
  const categoriesByProductId = new Map<string, string[]>()
  const featuredProducts: HttpTypes.StoreProduct[] = []
  const seenProductIds = new Set<string>()

  for (const { product_id, category_key } of placements) {
    const categories = categoriesByProductId.get(product_id) ?? []

    if (category_key && !categories.includes(category_key)) {
      categories.push(category_key)
    }

    categoriesByProductId.set(product_id, categories)
  }

  for (const { product_id } of [...placements].sort(
    (first, second) => first.sort_order - second.sort_order
  )) {
    const product = productsById.get(product_id)

    if (!product || seenProductIds.has(product_id)) {
      continue
    }

    seenProductIds.add(product_id)
    featuredProducts.push({
      ...product,
      metadata: {
        ...(product.metadata ?? {}),
        categoryKeys: categoriesByProductId.get(product_id) ?? [],
      },
    })
  }

  const featuredHandles = new Set(featuredProducts.map(({ handle }) => handle))
  const games = [
    ...featuredProducts,
    ...getMockProducts(region).filter(
      ({ handle }) => !handle || !featuredHandles.has(handle)
    ),
  ]

  return games.filter(
    (game) =>
      !excludeIds.includes(game.id) &&
      (!game.handle || !excludeHandles.includes(game.handle))
  )
}