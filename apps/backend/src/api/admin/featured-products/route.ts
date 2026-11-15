import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { FEATURED_PRODUCT_MODULE } from "../../../modules/featured-product"
import type FeaturedProductModuleService from "../../../modules/featured-product/service"

const categoryKeys = [
  "categoria-pc-perifericos",
  "categoria-ps5",
  "categoria-xbox",
  "categoria-switch",
  "categoria-geek",
] as const

const createFeaturedProductSchema = z
  .object({
    category_key: z.enum(categoryKeys),
    product_id: z.string().min(1),
  })
  .strict()

const getService = (req: MedusaRequest) =>
  req.scope.resolve<FeaturedProductModuleService>(FEATURED_PRODUCT_MODULE)

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = getService(req)
  const [featured_products] = await service.listAndCountFeaturedProducts(
    {},
    { order: { sort_order: "ASC", created_at: "ASC" } },
  )

  res.json({ featured_products })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = createFeaturedProductSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: "Selecione uma categoria e um produto válidos.",
      errors: parsed.error.issues,
    })
  }

  const service = getService(req)
  const [existing] = await service.listAndCountFeaturedProducts({
    category_key: parsed.data.category_key,
    product_id: parsed.data.product_id,
  })

  if (existing.length) {
    return res.status(409).json({
      message: "Este produto já está em destaque nesta categoria.",
    })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "status"],
    filters: { id: parsed.data.product_id },
  })

  if (!products.length || products[0].status !== "published") {
    return res
      .status(400)
      .json({ message: "Somente produtos publicados podem ser destacados." })
  }

  const [categoryProducts] = await service.listAndCountFeaturedProducts({
    category_key: parsed.data.category_key,
  })
  const featured_product = await service.createFeaturedProducts({
    ...parsed.data,
    sort_order: categoryProducts.length,
    is_active: true,
  })

  res.status(201).json({ featured_product })
}
