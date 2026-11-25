import type {
  CreatePriceListPriceWorkflowDTO,
  ExecArgs,
  UpdatePriceListPriceWorkflowDTO,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  PriceListStatus,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  batchPriceListPricesWorkflow,
  createPriceListsWorkflow,
} from "@medusajs/medusa/core-flows"

const PRICE_LIST_TITLE = "NuveX Random Sale"

type ProductVariantPriceSetLink = {
  variant_id: string
  price_set_id: string
}

const getDiscountPercent = (handle: string) => {
  let hash = 0

  for (const character of handle) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }

  return 27 + (hash % 41)
}

const getDiscountedAmount = (amount: number, discountPercent: number) =>
  Math.round(amount * (100 - discountPercent)) / 100

export default async function randomizeStoreDiscounts({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "status", "variants.id"],
  })

  const publishedProducts = products.filter(
    (product) =>
      product.status === ProductStatus.PUBLISHED &&
      typeof product.handle === "string"
  )
  const variantIds = publishedProducts.flatMap((product) =>
    product.variants.map((variant) => variant.id)
  )

  if (!variantIds.length) {
    logger.warn("No published product base prices were found for discounting.")
    return
  }

  // The product_variant_price_set link is not represented on ProductVariantDTO.
  const { data: rawPriceSetLinks } = await query.graph({
    entity: "product_variant_price_set",
    fields: ["variant_id", "price_set_id"],
    filters: { variant_id: variantIds },
  })
  const priceSetLinks = rawPriceSetLinks as unknown as ProductVariantPriceSetLink[]
  const variantIdByPriceSetId = new Map(
    priceSetLinks.map(({ variant_id, price_set_id }) => [price_set_id, variant_id])
  )
  const priceSetIds = [...variantIdByPriceSetId.keys()]

  if (!priceSetIds.length) {
    logger.warn("No published product base prices were found for discounting.")
    return
  }

  const pricing = container.resolve(Modules.PRICING)
  const basePrices = await pricing.listPrices(
    { price_set_id: priceSetIds },
    { relations: ["price_list"] }
  )
  const prices: CreatePriceListPriceWorkflowDTO[] = basePrices.flatMap(
    (price) => {
      const variantId = price.price_set_id
        ? variantIdByPriceSetId.get(price.price_set_id)
        : undefined

      if (
        !variantId ||
        price.price_list ||
        price.amount == null ||
        !price.currency_code
      ) {
        return []
      }

      const product = publishedProducts.find((candidate) =>
        candidate.variants.some((variant) => variant.id === variantId)
      )

      if (!product) {
        return []
      }

      return [{
        variant_id: variantId,
        currency_code: price.currency_code,
        amount: getDiscountedAmount(
          Number(price.amount),
          getDiscountPercent(product.handle)
        ),
      }]
    }
  )

  if (!prices.length) {
    logger.warn("No published product base prices were found for discounting.")
    return
  }

  const { data: existingPriceLists } = await query.graph({
    entity: "price_list",
    fields: [
      "id",
      "title",
      "prices.id",
      "prices.price_set_id",
      "prices.currency_code",
    ],
    filters: { title: PRICE_LIST_TITLE },
  })
  const priceList = existingPriceLists[0]

  if (!priceList) {
    await createPriceListsWorkflow(container).run({
      input: {
        price_lists_data: [
          {
            title: PRICE_LIST_TITLE,
            description:
              "Stable randomized discounts from 27% to 67% for published store products.",
            status: PriceListStatus.ACTIVE,
            prices,
          },
        ],
      },
    })
  } else {
    const desiredByKey = new Map<string, CreatePriceListPriceWorkflowDTO>()
    for (const price of prices) {
      desiredByKey.set(
        `${price.variant_id}:${price.currency_code}`,
        price
      )
    }

    const existingByKey = new Map<
      string,
      Pick<UpdatePriceListPriceWorkflowDTO, "id" | "variant_id" | "currency_code">
    >()
    const priceIdsToDelete: string[] = []

    for (const price of priceList.prices ?? []) {
      if (!price) {
        continue
      }

      const variantId = price.price_set_id
        ? variantIdByPriceSetId.get(price.price_set_id)
        : undefined

      if (!variantId || !price.currency_code) {
        priceIdsToDelete.push(price.id)
        continue
      }

      const key = `${variantId}:${price.currency_code}`
      if (existingByKey.has(key)) {
        priceIdsToDelete.push(price.id)
      } else {
        existingByKey.set(key, {
          id: price.id,
          variant_id: variantId,
          currency_code: price.currency_code,
        })
      }
    }

    const create: CreatePriceListPriceWorkflowDTO[] = []
    const update: UpdatePriceListPriceWorkflowDTO[] = []

    for (const [key, desiredPrice] of desiredByKey) {
      const existingPrice = existingByKey.get(key)

      if (!existingPrice) {
        create.push(desiredPrice)
      } else {
        update.push({
          ...desiredPrice,
          id: existingPrice.id,
        })
        existingByKey.delete(key)
      }
    }

    priceIdsToDelete.push(
      ...Array.from(existingByKey.values()).map((price) => price.id)
    )

    await batchPriceListPricesWorkflow(container).run({
      input: {
        data: {
          id: priceList.id,
          create,
          update,
          delete: priceIdsToDelete,
        },
      },
    })
  }

  logger.info(
    `Applied stable 27%-67% discounts to ${publishedProducts.length} published product(s) across ${prices.length} price(s).`
  )
}
