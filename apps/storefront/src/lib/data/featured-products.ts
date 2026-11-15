import { sdk } from "@lib/config"

export type FeaturedProductPlacement = {
  category_key: string
  product_id: string
  sort_order: number
}

export async function listFeaturedProductPlacements() {
  const { featured_products } = await sdk.client.fetch<{
    featured_products: FeaturedProductPlacement[]
  }>("/store/featured-products")

  return featured_products
}
