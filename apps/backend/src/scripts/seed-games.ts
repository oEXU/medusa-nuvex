/**
 * Creates the real Medusa products for the seven games that the storefront
 * currently renders from `apps/storefront/src/lib/data/mock-products.ts`.
 *
 *   npx medusa exec ./src/scripts/seed-games.ts
 *
 * Safe to re-run: products are matched by handle, featured placements by
 * (category_key, product_id), and inventory levels by (inventory_item_id,
 * location_id). Nothing is duplicated.
 *
 * What it creates per game:
 *   - one published product with a single variant ("PS5" / "Xbox")
 *   - prices in every currency the store supports among BRL and USD
 *   - the product `metadata` keys the storefront reads
 *     (`listingBadge`, `categoryKeys`, `imageByCategory`)
 *   - a stock level (0 for games that should render as unavailable)
 *   - one `featured_product` row per platform category
 *
 * It also creates a single sale price list ("NuveX Sale") for the games that
 * carry a discount in the mocks, so the listing renders the crossed-out price
 * and the "-X%" badge exactly like the mock version does.
 *
 * The images are the files already shipped in `apps/storefront/public/`, so the
 * storefront can serve them as local paths. If you later upload them to the
 * file storage, replace the `thumbnail` / `images` values below with the
 * returned URLs.
 */
import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
  PriceListStatus,
  PriceListType,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createPriceListsWorkflow,
  createProductsWorkflow,
  deleteProductsWorkflow,
  updateInventoryLevelsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import { FEATURED_PRODUCT_MODULE } from "../modules/featured-product"
import type FeaturedProductModuleService from "../modules/featured-product/service"

const SALE_PRICE_LIST_TITLE = "NuveX Sale"
/** Stocked quantity for games that are available; 0 keeps them sold out. */
const IN_STOCK_QUANTITY = 999

type SeedGame = {
  handle: string
  title: string
  subtitle: string
  description: string
  thumbnail: string
  variantTitle: string
  sku: string
  /** Regular price in major units (235.08 = R$ 235,08). */
  price: { brl: number; usd: number }
  /** Sale price in major units; omit when the game has no discount. */
  salePrice?: { brl: number; usd: number }
  /** Display order in the storefront grid (lower comes first). */
  sortOrder: number
  /** `category_key` values accepted by the featured-product module. */
  categories: string[]
  /** Badge rendered over the card in the listing. */
  listingBadge?: string
  /** Per-category thumbnail, used by the XBOX view. */
  imageByCategory?: Record<string, string>
  /** `false` renders the variant as "Indisponível no momento". */
  available?: boolean
}

/**
 * Values mirror `MOCK_PRODUCTS`: the mocks store cents, Medusa stores major
 * units, so every number below is the mock value divided by 100.
 * Order follows what the storefront renders: badged games first, sold-out last.
 */
const GAMES: SeedGame[] = [
  {
    handle: "grand-theft-auto-vi-ultimate-edition-primaria",
    title: "Grand Theft Auto VI Ultimate Edition - Primária",
    subtitle: "PlayStation 5",
    description:
      "Grand Theft Auto VI Ultimate Edition na versão primária, com o jogo base e conteúdos extras para PlayStation 5.",
    thumbnail: "/gta-vi-aura.png",
    variantTitle: "PS5",
    sku: "GTAVI-ULTIMATE-PRIMARIA-PS5",
    price: { brl: 371.88, usd: 71.99 },
    salePrice: { brl: 309.9, usd: 59.99 },
    sortOrder: 10,
    categories: ["categoria-ps5", "categoria-xbox"],
    listingBadge: "MAIS VENDIDO",
  },
  {
    handle: "grand-theft-auto-vi-ultimate-edition-secundaria",
    title: "Grand Theft Auto VI Ultimate Edition - Secundária",
    subtitle: "PlayStation 5",
    description:
      "Grand Theft Auto VI Ultimate Edition na versão secundária, com o jogo base e conteúdos extras para PlayStation 5.",
    thumbnail: "/gta-vi-aura.png",
    variantTitle: "PS5",
    sku: "GTAVI-ULTIMATE-SECUNDARIA-PS5",
    price: { brl: 311.99, usd: 71.99 },
    salePrice: { brl: 259.99, usd: 59.99 },
    sortOrder: 20,
    categories: ["categoria-ps5", "categoria-xbox"],
  },
  {
    handle: "fc-2026",
    title: "FC 2026",
    subtitle: "PlayStation 5",
    description:
      "FC 2026 traz o futebol mais realista da temporada, com novos modos de jogo e gráficos para PlayStation 5.",
    thumbnail: "/fc-2026.webp",
    variantTitle: "PS5",
    sku: "FC26-PS5",
    price: { brl: 220.9, usd: 42.99 },
    sortOrder: 40,
    categories: ["categoria-ps5"],
  },
  {
    handle: "the-last-of-us-part-ii",
    title: "The Last Of Us II",
    subtitle: "PlayStation 5",
    description:
      "The Last of Us Part II acompanha Ellie em uma jornada intensa de sobrevivência e vingança para PlayStation 5.",
    thumbnail: "/the-last-of-us-part-ii.webp",
    variantTitle: "PS5",
    sku: "TLOU2-PS5",
    price: { brl: 130, usd: 29.99 },
    sortOrder: 50,
    categories: ["categoria-ps5"],
  },
  {
    handle: "assassins-creed-valhalla",
    title: "Assassin's Creed Valhalla",
    subtitle: "Xbox",
    description:
      "Assassin's Creed Valhalla leva você à era viking em um mundo aberto de exploração e combate para Xbox.",
    thumbnail: "/assassins-creed-valhalla.webp",
    variantTitle: "Xbox",
    sku: "ACV-XBOX",
    price: { brl: 149, usd: 34.99 },
    sortOrder: 60,
    categories: ["categoria-xbox"],
  },
  {
    handle: "red-dead-redemption-2",
    title: "Red Dead Redemption 2",
    subtitle: "PlayStation 5",
    description:
      "Red Dead Redemption 2 acompanha Arthur Morgan no crepúsculo do Velho Oeste, em um vasto mundo aberto com história épica e detalhes impressionantes para PlayStation 5.",
    thumbnail: "/red-dead-redemption-2.webp",
    variantTitle: "PS5",
    sku: "RDR2-PS5",
    price: { brl: 249.9, usd: 49.99 },
    sortOrder: 70,
    categories: ["categoria-ps5", "categoria-xbox"],
    imageByCategory: {
      "categoria-ps5": "/red-dead-redemption-2.webp",
      "categoria-xbox": "/red-dead-redemption-2-xbox.webp",
    },
    available: false,
  },
]

const HANDLES = GAMES.map((game) => game.handle)

type SeededVariant = {
  handle: string
  variantId: string
  inventoryItemId?: string
}

const getGame = (handle: string) =>
  GAMES.find((game) => game.handle === handle) as SeedGame

const supportedCurrencies = (currencyCodes: string[]) =>
  (["brl", "usd"] as const).filter((code) => currencyCodes.includes(code))

export default async function seedGames({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "supported_currencies.currency_code"],
  })
  const currencyCodes = (stores[0]?.supported_currencies ?? [])
    .map((currency) => currency?.currency_code)
    .filter((code): code is string => Boolean(code))
  const currencies = supportedCurrencies(currencyCodes)

  if (!currencies.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "The store supports neither BRL nor USD. Run the initial data seed first."
    )
  }

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

  // ---- Products ------------------------------------------------------------

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: HANDLES },
  })
  const takenHandles = new Set(
    existingProducts.map((product) => product.handle).filter(Boolean)
  )
  const missingGames = GAMES.filter((game) => !takenHandles.has(game.handle))

  if (missingGames.length) {
    await createProductsWorkflow(container).run({
      input: {
        products: missingGames.map((game) => ({
          title: game.title,
          handle: game.handle,
          subtitle: game.subtitle,
          description: game.description,
          status: ProductStatus.PUBLISHED,
          thumbnail: game.thumbnail,
          images: [{ url: game.thumbnail }],
          weight: 100,
          shipping_profile_id: shippingProfile.id,
          sales_channels: [{ id: salesChannel.id }],
          options: [
            { title: "Plataforma", values: [game.variantTitle] },
          ],
          variants: [
            {
              title: game.variantTitle,
              sku: game.sku,
              options: { Plataforma: game.variantTitle },
              prices: currencies.map((currency) => ({
                amount: game.price[currency],
                currency_code: currency,
              })),
            },
          ],
          metadata: {
            ...(game.listingBadge ? { listingBadge: game.listingBadge } : {}),
            categoryKeys: game.categories,
            ...(game.imageByCategory
              ? { imageByCategory: game.imageByCategory }
              : {}),
          },
        })),
      },
    })
    logger.info(`Created ${missingGames.length} game product(s).`)
  } else {
    logger.info("Every game product already exists.")
  }

  // Re-read everything (new and pre-existing) to get ids and variants.
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "thumbnail", "images.url", "variants.id", "variants.sku"],
    filters: { handle: HANDLES },
  })

  const gtaViProducts = products.filter((product) =>
    [
      "grand-theft-auto-vi-ultimate-edition-primaria",
      "grand-theft-auto-vi-ultimate-edition-secundaria",
    ].includes(product.handle as string)
  )

  if (gtaViProducts.length) {
    await updateProductsWorkflow(container).run({
      input: {
        products: gtaViProducts.map((product) => ({
          id: product.id,
          thumbnail: "/gta-vi-aura.png",
          images: [{ url: "/gta-vi-aura.png" }],
        })),
      },
    })
    logger.info("Updated 2 GTA VI product image(s).")
  }

  const seededVariants: SeededVariant[] = products.flatMap((product) =>
    (product.variants ?? []).map((variant) => ({
      handle: product.handle as string,
      variantId: variant?.id as string,
    }))
  )

  if (!seededVariants.length) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "No variants were found for the seeded games."
    )
  }

  // ---- Inventory -----------------------------------------------------------

  const variantIds = seededVariants.map((variant) => variant.variantId)
  const { data: variantInventoryLinks } = await query.graph({
    entity: "product_variant_inventory_item",
    fields: ["variant_id", "inventory_item_id"],
    filters: { variant_id: variantIds },
  })

  const inventoryItemByVariant = new Map<string, string>(
    variantInventoryLinks.map((link) => [link.variant_id as string, link.inventory_item_id as string])
  )

  for (const variant of seededVariants) {
    variant.inventoryItemId = inventoryItemByVariant.get(variant.variantId)
  }

  const missingLinks = seededVariants.filter(
    (variant) => !variant.inventoryItemId
  )

  if (missingLinks.length) {
    logger.warn(
      `${missingLinks.length} variant(s) have no inventory item. Run again after the variant inventory is created.`
    )
  }

  const { data: existingLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["id", "inventory_item_id", "location_id"],
    filters: { location_id: stockLocation.id },
  })
  const levelByItem = new Map<string, string>(
    existingLevels.map((level) => [level.inventory_item_id as string, level.id as string])
  )

  const levelsToCreate: {
    inventory_item_id: string
    location_id: string
    stocked_quantity: number
  }[] = []
  const levelsToUpdate: {
    id: string
    inventory_item_id: string
    location_id: string
    stocked_quantity: number
  }[] = []

  for (const variant of seededVariants) {
    if (!variant.inventoryItemId) {
      continue
    }

    const game = getGame(variant.handle)
    const stockedQuantity = game.available === false ? 0 : IN_STOCK_QUANTITY
    const levelId = levelByItem.get(variant.inventoryItemId)

    if (levelId) {
      levelsToUpdate.push({
        id: levelId,
        inventory_item_id: variant.inventoryItemId,
        location_id: stockLocation.id,
        stocked_quantity: stockedQuantity,
      })
    } else {
      levelsToCreate.push({
        inventory_item_id: variant.inventoryItemId,
        location_id: stockLocation.id,
        stocked_quantity: stockedQuantity,
      })
    }
  }

  if (levelsToCreate.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: levelsToCreate },
    })
    logger.info(`Created ${levelsToCreate.length} inventory level(s).`)
  }

  if (levelsToUpdate.length) {
    await updateInventoryLevelsWorkflow(container).run({
      input: { updates: levelsToUpdate },
    })
    logger.info(`Updated ${levelsToUpdate.length} inventory level(s).`)
  }

  // ---- Sale price list (the crossed-out price + discount badge) -------------

  const discountedVariants = seededVariants.filter(
    (variant) => getGame(variant.handle).salePrice
  )

  const { data: existingPriceLists } = await query.graph({
    entity: "price_list",
    fields: ["id", "title"],
    filters: { title: SALE_PRICE_LIST_TITLE },
  })

  if (discountedVariants.length && !existingPriceLists.length) {
    await createPriceListsWorkflow(container).run({
      input: {
        // `price_lists_data` is typed upstream as `{ price_lists: [...] }[]`,
        // while the workflow reads each entry as a price list. The cast matches
        // the runtime shape; same workaround the other backend scripts use.
        price_lists_data: [
          {
            title: SALE_PRICE_LIST_TITLE,
            name: SALE_PRICE_LIST_TITLE,
            description: "Storefront sale prices for the seeded games.",
            type: PriceListType.SALE,
            status: PriceListStatus.ACTIVE,
            prices: discountedVariants.flatMap((variant) => {
              const salePrice = getGame(variant.handle).salePrice

              return currencies.map((currency) => ({
                variant_id: variant.variantId,
                currency_code: currency,
                amount: (salePrice as { brl: number; usd: number })[currency],
              }))
            }),
          },
        ] as never,
      },
    })
    logger.info(`Created the "${SALE_PRICE_LIST_TITLE}" sale price list.`)
  } else if (existingPriceLists.length) {
    logger.info(`Price list "${SALE_PRICE_LIST_TITLE}" already exists.`)
  }

  // ---- Featured placements -------------------------------------------------

  const featuredService = container.resolve<FeaturedProductModuleService>(
    FEATURED_PRODUCT_MODULE
  )
  const removedProductHandle = "grand-theft-auto-vi-standard-edition"
  const { data: removedProducts } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { handle: removedProductHandle },
  })

  if (removedProducts.length) {
    const removedProductIds = removedProducts
      .map((product) => product.id)
      .filter((id): id is string => Boolean(id))
    const [removedPlacements] =
      await featuredService.listAndCountFeaturedProducts({
        product_id: removedProductIds,
      })

    if (removedPlacements.length) {
      await featuredService.deleteFeaturedProducts(
        removedPlacements.map((placement) => placement.id)
      )
    }

    await deleteProductsWorkflow(container).run({
      input: { ids: removedProductIds },
    })
    logger.info(`Deleted product "${removedProductHandle}".`)
  }

  const [existingPlacements] = await featuredService.listAndCountFeaturedProducts(
    {},
    { take: 1000 }
  )
  const placementKey = (categoryKey: string, productId: string) =>
    `${categoryKey}::${productId}`
  const takenPlacements = new Set(
    existingPlacements.map((placement) =>
      placementKey(placement.category_key, placement.product_id)
    )
  )

  const productIdByHandle = new Map<string, string>(
    products.map((product) => [product.handle as string, product.id as string])
  )
  const gtaViHandles = new Set([
    "grand-theft-auto-vi-ultimate-edition-primaria",
    "grand-theft-auto-vi-ultimate-edition-secundaria",
  ])
  const pcPlacementsToRemove = existingPlacements.filter((placement) => {
    const handle = products.find(
      (product) => product.id === placement.product_id
    )?.handle

    return (
      placement.category_key === "categoria-pc-perifericos" &&
      typeof handle === "string" &&
      gtaViHandles.has(handle)
    )
  })

  if (pcPlacementsToRemove.length) {
    await featuredService.deleteFeaturedProducts(
      pcPlacementsToRemove.map((placement) => placement.id)
    )
    logger.info(
      `Removed ${pcPlacementsToRemove.length} GTA VI PC category placement(s).`
    )
  }

  const placementsToCreate = GAMES.flatMap((game) => {
    const productId = productIdByHandle.get(game.handle)

    if (!productId) {
      return []
    }

    return game.categories
      .filter(
        (categoryKey) =>
          !takenPlacements.has(placementKey(categoryKey, productId))
      )
      .map((categoryKey) => ({
        category_key: categoryKey,
        product_id: productId,
        sort_order: game.sortOrder,
        is_active: true,
      }))
  })

  if (placementsToCreate.length) {
    await featuredService.createFeaturedProducts(placementsToCreate)
    logger.info(`Created ${placementsToCreate.length} featured placement(s).`)
  } else {
    logger.info("Every featured placement already exists.")
  }

  // ---- Search index --------------------------------------------------------

  // `medusa exec` can exit before the async `product.created` ingestion runs,
  // so replay it here. `consume` upserts, so re-ingesting is safe.
  const search = container.resolve(Modules.SEARCH)

  await search.ingest({
    name: "product.created",
    data: products.map((product) => ({ id: product.id })),
  } as never)

  logger.info(`Search index caught up for ${products.length} product(s).`)
  logger.info(
    `Done. ${GAMES.length} game(s) seeded across: ${currencies.join(", ")}.`
  )
}
