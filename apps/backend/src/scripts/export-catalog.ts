import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

export default async function exportCatalog({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info("Exporting full catalog from database...")

  // 1. Export Categories
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: [
      "id",
      "name",
      "handle",
      "description",
      "is_active",
      "is_internal",
      "parent_category_id",
      "rank",
      "metadata",
    ],
  })

  // 2. Export Products with all relations
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "subtitle",
      "description",
      "handle",
      "is_giftcard",
      "discountable",
      "thumbnail",
      "status",
      "weight",
      "length",
      "height",
      "width",
      "origin_country",
      "hs_code",
      "mid_code",
      "material",
      "metadata",
      "type.*",
      "collection.*",
      "tags.*",
      "categories.id",
      "categories.handle",
      "categories.name",
      "images.id",
      "images.url",
      "options.id",
      "options.title",
      "options.values.id",
      "options.values.value",
      "variants.id",
      "variants.title",
      "variants.sku",
      "variants.barcode",
      "variants.ean",
      "variants.upc",
      "variants.allow_backorder",
      "variants.manage_inventory",
      "variants.weight",
      "variants.length",
      "variants.height",
      "variants.width",
      "variants.metadata",
      "variants.options.id",
      "variants.options.value",
      "variants.options.option_id",
      "variants.prices.id",
      "variants.prices.currency_code",
      "variants.prices.amount",
      "variants.prices.min_quantity",
      "variants.prices.max_quantity",
      "variants.prices.price_list_id",
    ],
  })

  // 3. Export Inventory levels
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: [
      "id",
      "sku",
      "title",
      "description",
      "location_levels.id",
      "location_levels.location_id",
      "location_levels.stocked_quantity",
      "location_levels.reserved_quantity",
      "location_levels.incoming_quantity",
    ],
  })

  // 4. Export Price Lists (sales, promos)
  const { data: priceLists } = await query.graph({
    entity: "price_list",
    fields: [
      "id",
      "title",
      "description",
      "status",
      "type",
      "starts_at",
      "ends_at",
      "rules",
      "prices.*",
    ],
  })

  // 5. Export Featured Products (custom module)
  let featuredProducts: any[] = []
  try {
    const { data: fp } = await query.graph({
      entity: "featured_product",
      fields: ["id", "category_key", "product_id", "sort_order", "is_active"],
    })
    featuredProducts = fp
  } catch (err: any) {
    logger.warn(`Could not export featured_products: ${err.message}`)
  }

  // 6. Export Promo Banners (custom module)
  let promoBanners: any[] = []
  try {
    const { data: pb } = await query.graph({
      entity: "promo_banner",
      fields: [
        "id",
        "type",
        "title",
        "subtitle",
        "image_url",
        "mobile_image_url",
        "image_only",
        "alt_text",
        "link_url",
        "cta_label",
        "sort_order",
        "is_active",
        "starts_at",
        "ends_at",
      ],
    })
    promoBanners = pb
  } catch (err: any) {
    logger.warn(`Could not export promo_banners: ${err.message}`)
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    totalProducts: products.length,
    totalCategories: categories.length,
    categories,
    products,
    inventoryItems,
    priceLists,
    featuredProducts,
    promoBanners,
  }

  const outputPath = path.resolve(process.cwd(), "src/data/catalog-export.json")
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), "utf8")

  logger.info(`Successfully exported ${products.length} products to ${outputPath}`)
}
