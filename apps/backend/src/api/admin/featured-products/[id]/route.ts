import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FEATURED_PRODUCT_MODULE } from "../../../../modules/featured-product"
import type FeaturedProductModuleService from "../../../../modules/featured-product/service"

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<FeaturedProductModuleService>(
    FEATURED_PRODUCT_MODULE,
  )
  await service.deleteFeaturedProducts(req.params.id)

  res.json({ id: req.params.id, deleted: true })
}
