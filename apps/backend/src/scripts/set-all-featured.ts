import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { FEATURED_PRODUCT_MODULE } from "../modules/featured-product"
import type FeaturedProductModuleService from "../modules/featured-product/service"

const PAGE_SIZE = 100
const FEATURED_CATEGORIES = [
  "categoria-pc-perifericos",
  "categoria-ps5",
  "categoria-xbox",
  "categoria-switch",
  "categoria-geek",
] as const

export default async function setAllFeatured({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const featuredService = container.resolve<FeaturedProductModuleService>(
    FEATURED_PRODUCT_MODULE
  )

  logger.info("Placing all catalog products in featured categories...")

  // Fetch every page so larger catalogs are fully covered.
  const firstPage = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "status", "metadata"],
    pagination: { skip: 0, take: PAGE_SIZE },
  })
  const allProducts = [...firstPage.data]

  for (let skip = PAGE_SIZE; ; skip += PAGE_SIZE) {
    const { data: page } = await query.graph({
      entity: "product",
      fields: ["id", "title", "handle", "status", "metadata"],
      pagination: { skip, take: PAGE_SIZE },
    })
    if (page.length === 0) break
    allProducts.push(...page)
    if (page.length < PAGE_SIZE) break
  }

  const dummyHandles = new Set([
    "sweatshirt",
    "sweatpants",
    "shorts",
    "t-shirt",
    "1",
    "grand-theft-auto-vi-standard-edition",
  ])

  const products = allProducts.filter(
    (p) =>
      p.status === "published" &&
      typeof p.handle === "string" &&
      !dummyHandles.has(p.handle)
  )

  logger.info(`Found ${products.length} published products to feature.`)

  // 2. Fetch existing featured product placements
  const [existingPlacements] = await featuredService.listAndCountFeaturedProducts(
    {},
    { take: 1000 }
  )
  const existingByKey = new Map(
    existingPlacements.map((placement) => [
      `${placement.category_key}::${placement.product_id}`,
      placement,
    ])
  )
  const placementsToCreate: Array<{
    category_key: (typeof FEATURED_CATEGORIES)[number]
    product_id: string
    sort_order: number
    is_active: boolean
  }> = []
  let reactivatedCount = 0
  const nextSortOrder = new Map<string, number>()
  for (const placement of existingPlacements) {
    const next = Math.max(
      nextSortOrder.get(placement.category_key) ?? 0,
      placement.sort_order + 1
    )
    nextSortOrder.set(placement.category_key, next)
  }

  for (const product of products) {
    const text = `${product.title} ${product.handle}`.toLowerCase()
    const metadata = (product.metadata ?? {}) as Record<string, unknown>
    const targetCategories = new Set<(typeof FEATURED_CATEGORIES)[number]>()
    const storedCategories = Array.isArray(metadata.categoryKeys)
      ? metadata.categoryKeys
      : []

    const metadataCategories =
      text.includes("grand theft auto") || text.includes("gta")
        ? storedCategories.filter(
            (category) => category !== "categoria-pc-perifericos"
          )
        : storedCategories

    for (const category of metadataCategories) {
      if (
        typeof category === "string" &&
        FEATURED_CATEGORIES.includes(category as (typeof FEATURED_CATEGORIES)[number])
      ) {
        targetCategories.add(category as (typeof FEATURED_CATEGORIES)[number])
      }
    }

    // PS5 & PlayStation
    if (
      text.includes("ps5") ||
      text.includes("playstation") ||
      text.includes("ps4") ||
      text.includes("dualsense") ||
      text.includes("pulse") ||
      text.includes("last of us") ||
      text.includes("fc 2026") ||
      text.includes("gta")
    ) {
      targetCategories.add("categoria-ps5")
    }

    // XBOX
    if (
      text.includes("xbox") ||
      text.includes("assassin") ||
      text.includes("valhalla") ||
      text.includes("red dead") ||
      text.includes("gta") ||
      text.includes("rog")
    ) {
      targetCategories.add("categoria-xbox")
    }

    // Nintendo Switch
    if (
      text.includes("switch") ||
      text.includes("nintendo") ||
      text.includes("mario")
    ) {
      targetCategories.add("categoria-switch")
    }

    // PC e Periféricos
    if (
      text.includes("pc") ||
      text.includes("notebook") ||
      text.includes("monitor") ||
      text.includes("placa") ||
      text.includes("processador") ||
      text.includes("ryzen") ||
      text.includes("intel") ||
      text.includes("rtx") ||
      text.includes("rx ") ||
      text.includes("rx-") ||
      text.includes("ssd") ||
      text.includes("kingston") ||
      text.includes("sandisk") ||
      text.includes("memória") ||
      text.includes("volante") ||
      text.includes("kabum") ||
      text.includes("ar condicionado")
    ) {
      targetCategories.add("categoria-pc-perifericos")
    }

    // Geek
    if (
      text.includes("geek") ||
      text.includes("minecraft") ||
      text.includes("gift card") ||
      text.includes("kabum") ||
      text.includes("ar condicionado") ||
      text.includes("switch") ||
      text.includes("headset") ||
      text.includes("volante")
    ) {
      targetCategories.add("categoria-geek")
    }

    // Keep unclassified published catalog items visible in the general PC category.
    if (targetCategories.size === 0) {
      targetCategories.add("categoria-pc-perifericos")
    }

    // Create missing placements and restore existing placements hidden by an
    // inactive flag. Existing sort order is preserved.
    for (const catKey of targetCategories) {
      const key = `${catKey}::${product.id}`
      const existing = existingByKey.get(key)
      if (!existing) {
        const sortOrder = nextSortOrder.get(catKey) ?? 0
        placementsToCreate.push({
          category_key: catKey,
          product_id: product.id as string,
          sort_order: sortOrder,
          is_active: true,
        })
        nextSortOrder.set(catKey, sortOrder + 1)
      } else if (!existing.is_active) {
        await featuredService.updateFeaturedProducts({
          id: existing.id,
          is_active: true,
        })
        reactivatedCount++
      }
    }

    const combinedKeys = Array.from(
      new Set([...metadataCategories, ...targetCategories])
    )

    if (
      combinedKeys.length !== metadataCategories.length ||
      combinedKeys.some((key, index) => key !== metadataCategories[index]) ||
      metadataCategories.length !== storedCategories.length
    ) {
      await updateProductsWorkflow(container).run({
        input: {
          selector: { id: product.id },
          update: {
            metadata: {
              ...metadata,
              categoryKeys: combinedKeys,
            },
          },
        },
      })
    }
  }

  if (placementsToCreate.length) {
    await featuredService.createFeaturedProducts(placementsToCreate)
  }

  logger.info(
    `Featured ${products.length} published products across categories. Created ${placementsToCreate.length} placements and reactivated ${reactivatedCount}.`
  )
}
