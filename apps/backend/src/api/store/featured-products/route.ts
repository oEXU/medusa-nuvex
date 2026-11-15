import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FEATURED_PRODUCT_MODULE } from "../../../modules/featured-product"
import type FeaturedProductModuleService from "../../../modules/featured-product/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<FeaturedProductModuleService>(
    FEATURED_PRODUCT_MODULE,
  )
  const [featured_products] = await service.listAndCountFeaturedProducts(
    { is_active: true },
    { order: { sort_order: "ASC", created_at: "ASC" } },
  )

  res.setHeader("Cache-Control", "public, max-age=30, s-maxage=30")
  res.json({
    featured_products: featured_products.map(
      ({ category_key, product_id, sort_order }) => ({
        category_key,
        product_id,
        sort_order,
      }),
    ),
  })
}
