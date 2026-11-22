/**
 * Seeds the complete NuveX catalog (50+ products, categories, promo banners,
 * and featured placements) exported from the local database.
 *
 *   npx medusa exec ./src/scripts/seed-catalog.ts
 */
import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  deleteProductsWorkflow,
  updateInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows"
import fs from "fs"
import path from "path"
import { FEATURED_PRODUCT_MODULE } from "../modules/featured-product"
import type FeaturedProductModuleService from "../modules/featured-product/service"
import { PROMO_BANNER_MODULE } from "../modules/promo-banner"
import type PromoBannerModuleService from "../modules/promo-banner/service"

export default async function seedCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const exportFilePath = path.resolve(
    process.cwd(),
    "src/data/catalog-export.json"
  )
  if (!fs.existsSync(exportFilePath)) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Catalog export file not found at ${exportFilePath}. Run export-catalog first.`
    )
  }

  const catalogData = JSON.parse(fs.readFileSync(exportFilePath, "utf8"))
  const { categories: exportCategories, products: exportProducts, promoBanners, featuredProducts } = catalogData

  logger.info(`Starting full catalog seed (${exportProducts.length} products)...`)

  // 1. Clean starter dummy clothes
  const dummyHandles = new Set([
    "sweatshirt",
    "sweatpants",
    "shorts",
    "t-shirt",
    "grand-theft-auto-vi-standard-edition",
    "1",
  ])
  const { data: allExisting } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  })
  const toDelete = allExisting.filter(
    (p) => typeof p.handle === "string" && dummyHandles.has(p.handle)
  )
  if (toDelete.length > 0) {
    await deleteProductsWorkflow(container).run({
      input: { ids: toDelete.map((p) => p.id as string) },
    })
    logger.info(`Deleted ${toDelete.length} starter dummy product(s).`)
  }

  // 2. Default sales channel, shipping profile, stock location
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  })

  const salesChannel = salesChannels[0]
  const shippingProfile = shippingProfiles[0]
  const stockLocation = stockLocations[0]

  if (!salesChannel || !shippingProfile || !stockLocation) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Missing sales channel, shipping profile or stock location. Run `medusa db:migrate` first."
    )
  }

  // 3. Ensure Categories
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name"],
  })
  const categoryByHandle = new Map<string, { id: string; name: string }>(
    existingCategories.map((c) => [c.handle as string, { id: c.id as string, name: c.name as string }])
  )

  const missingCategories = (exportCategories as any[]).filter(
    (c) => !categoryByHandle.has(c.handle)
  )

  if (missingCategories.length > 0) {
    const { result: createdCategories } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missingCategories.map((c) => ({
          name: c.name,
          handle: c.handle,
          description: c.description || undefined,
          is_active: c.is_active ?? true,
          is_internal: c.is_internal ?? false,
          metadata: c.metadata || undefined,
        })),
      },
    })
    for (const c of createdCategories) {
      categoryByHandle.set(c.handle, { id: c.id, name: c.name })
    }
    logger.info(`Created ${createdCategories.length} product category(ies).`)
  }

  // 4. Create missing Products
  const { data: currentProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  })
  const existingHandles = new Set(
    currentProducts.map((p) => p.handle).filter(Boolean)
  )

  const productsToCreate = (exportProducts as any[]).filter(
    (p) => !existingHandles.has(p.handle)
  )

  if (productsToCreate.length > 0) {
    logger.info(`Creating ${productsToCreate.length} missing product(s)...`)

    // Process in batches of 10 to avoid payload timeouts
    const BATCH_SIZE = 10
    for (let i = 0; i < productsToCreate.length; i += BATCH_SIZE) {
      const batch = productsToCreate.slice(i, i + BATCH_SIZE)
      const inputProducts = batch.map((p) => {
        // Resolve categories
        const catLinks = (p.categories || [])
          .map((c: any) => categoryByHandle.get(c.handle)?.id)
          .filter(Boolean)
          .map((id: string) => ({ id }))

        // Prepare options
        const optionMap: Record<string, string[]> = {}
        if (p.options && p.options.length > 0) {
          for (const opt of p.options) {
            const vals = (opt.values || []).map((v: any) => v.value).filter(Boolean)
            optionMap[opt.title] = vals.length > 0 ? vals : ["Padrão"]
          }
        } else {
          optionMap["Opção"] = ["Padrão"]
        }

        const optionsInput = Object.entries(optionMap).map(([title, values]) => ({
          title,
          values: Array.from(new Set(values)),
        }))

        // Prepare variants
        const variantsInput = (p.variants || []).map((v: any, vIdx: number) => {
          const varOptions: Record<string, string> = {}
          if (v.options && v.options.length > 0) {
            for (const vo of v.options) {
              const optDef = (p.options || []).find((o: any) => o.id === vo.option_id)
              const optTitle = optDef?.title || Object.keys(optionMap)[0] || "Opção"
              varOptions[optTitle] = vo.value || "Padrão"
            }
          }
          if (Object.keys(varOptions).length === 0) {
            const firstOptTitle = Object.keys(optionMap)[0] || "Opção"
            varOptions[firstOptTitle] = v.title || "Padrão"
          }

          // Prices
          const rawPrices = (v.prices || []).filter((pr: any) => !pr.price_list_id)
          const prices = rawPrices.map((pr: any) => ({
            currency_code: pr.currency_code.toLowerCase(),
            amount: Number(pr.amount),
          }))

          // Ensure USD fallback if only BRL exists or vice versa
          const hasBrl = prices.some((pr: any) => pr.currency_code === "brl")
          const hasUsd = prices.some((pr: any) => pr.currency_code === "usd")
          if (hasBrl && !hasUsd) {
            const brlPrice = prices.find((pr: any) => pr.currency_code === "brl")!.amount
            prices.push({ currency_code: "usd", amount: Number((brlPrice / 5.2).toFixed(2)) })
          } else if (hasUsd && !hasBrl) {
            const usdPrice = prices.find((pr: any) => pr.currency_code === "usd")!.amount
            prices.push({ currency_code: "brl", amount: Number((usdPrice * 5.2).toFixed(2)) })
          }

          return {
            title: v.title || `Variante ${vIdx + 1}`,
            sku: v.sku || `${p.handle.toUpperCase()}-VAR-${vIdx + 1}`,
            options: varOptions,
            prices,
            manage_inventory: true,
          }
        })

        const imagesInput = (p.images || []).map((img: any) => ({ url: img.url }))
        if (p.thumbnail && !imagesInput.some((img: any) => img.url === p.thumbnail)) {
          imagesInput.unshift({ url: p.thumbnail })
        }

        return {
          title: p.title,
          handle: p.handle,
          subtitle: p.subtitle || undefined,
          description: p.description || undefined,
          status: ProductStatus.PUBLISHED,
          thumbnail: p.thumbnail || imagesInput[0]?.url,
          images: imagesInput,
          categories: catLinks,
          sales_channels: [{ id: salesChannel.id }],
          shipping_profile_id: shippingProfile.id,
          options: optionsInput,
          variants: variantsInput.length > 0 ? variantsInput : [
            {
              title: "Padrão",
              sku: `${p.handle.toUpperCase()}-DEF`,
              options: { [optionsInput[0].title]: optionsInput[0].values[0] },
              prices: [
                { currency_code: "brl", amount: 99.9 },
                { currency_code: "usd", amount: 19.9 },
              ],
              manage_inventory: true,
            },
          ],
          metadata: p.metadata || {},
        }
      })

      await createProductsWorkflow(container).run({
        input: { products: inputProducts },
      })
      logger.info(`Seeded batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(productsToCreate.length / BATCH_SIZE)} (${batch.length} products).`)
    }
  } else {
    logger.info("All products from catalog-export already exist in database.")
  }

  // 5. Ensure inventory levels for all variants
  const { data: allProductsWithVariants } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "variants.id", "variants.sku"],
  })

  const allVariants = allProductsWithVariants.flatMap((p) => p.variants || [])
  const variantIds = allVariants.map((v) => v.id as string).filter(Boolean)

  if (variantIds.length > 0) {
    const { data: variantInventoryLinks } = await query.graph({
      entity: "product_variant_inventory_item",
      fields: ["variant_id", "inventory_item_id"],
      filters: { variant_id: variantIds },
    })

    const inventoryItemIds = Array.from(
      new Set(variantInventoryLinks.map((l) => l.inventory_item_id as string).filter(Boolean))
    )

    if (inventoryItemIds.length > 0) {
      const { data: existingLevels } = await query.graph({
        entity: "inventory_level",
        fields: ["id", "inventory_item_id", "location_id", "stocked_quantity"],
        filters: {
          inventory_item_id: inventoryItemIds,
          location_id: stockLocation.id,
        },
      })

      const stockedItemIds = new Set(
        existingLevels.map((l) => l.inventory_item_id as string)
      )
      const unstockedItemIds = inventoryItemIds.filter((id) => !stockedItemIds.has(id))

      if (unstockedItemIds.length > 0) {
        await createInventoryLevelsWorkflow(container).run({
          input: {
            inventory_levels: unstockedItemIds.map((itemId) => ({
              inventory_item_id: itemId,
              location_id: stockLocation.id,
              stocked_quantity: 999,
            })),
          },
        })
        logger.info(`Created inventory levels for ${unstockedItemIds.length} inventory item(s).`)
      }
    }
  }

  // 6. Restore Promo Banners
  try {
    const bannerService = container.resolve<PromoBannerModuleService>(PROMO_BANNER_MODULE)
    const existingBanners = await bannerService.listPromoBanners({})
    if (existingBanners.length === 0 && promoBanners && promoBanners.length > 0) {
      for (const pb of promoBanners) {
        await bannerService.createPromoBanners({
          type: pb.type || "promotion",
          title: pb.title,
          subtitle: pb.subtitle || null,
          image_url: pb.image_url,
          mobile_image_url: pb.mobile_image_url || null,
          image_only: pb.image_only ?? false,
          alt_text: pb.alt_text || pb.title,
          link_url: pb.link_url || null,
          cta_label: pb.cta_label || null,
          sort_order: pb.sort_order ?? pb.order ?? 0,
          is_active: pb.is_active ?? true,
        })
      }
      logger.info(`Restored ${promoBanners.length} promo banner(s).`)
    } else {
      logger.info(`Promo banners already present (${existingBanners.length} banner(s)).`)
    }
  } catch (err: any) {
    logger.warn(`Could not seed promo banners: ${err.message}`)
  }

  // 7. Restore Featured Products
  try {
    const featuredService = container.resolve<FeaturedProductModuleService>(FEATURED_PRODUCT_MODULE)
    const [existingFp] = await featuredService.listAndCountFeaturedProducts({})
    if (existingFp.length === 0 && featuredProducts && featuredProducts.length > 0) {
      for (const fp of featuredProducts) {
        await featuredService.createFeaturedProducts({
          category_key: fp.category_key,
          product_id: fp.product_id,
          sort_order: fp.sort_order ?? fp.order ?? 0,
          is_active: fp.is_active ?? true,
        })
      }
      logger.info(`Restored ${featuredProducts.length} featured product placement(s).`)
    } else {
      logger.info(`Featured products already present (${existingFp.length} placement(s)).`)
    }
  } catch (err: any) {
    logger.warn(`Could not seed featured products: ${err.message}`)
  }

  logger.info("Catalog seed completed successfully!")
}
