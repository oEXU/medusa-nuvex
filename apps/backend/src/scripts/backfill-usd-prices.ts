import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows"
import {
  BRL_PER_USD_RATE,
  convertBrlToUsd,
} from "../lib/currency-pricing"

const PAGE_SIZE = 100
const UPDATE_BATCH_SIZE = 50

type Product = {
  id: string
  title: string
  variants: ({ id: string; title: string } | null)[] | null
}

type VariantPriceSetLink = {
  variant_id: string
  price_set_id: string
}

type Price = {
  id: string
  amount: number
  currency_code: string
  min_quantity: number | null
  max_quantity: number | null
}

type PriceSet = {
  id: string
  prices: (Price | null)[] | null
}

export default async function backfillUsdPrices({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const rate = Number(process.env.BRL_PER_USD_RATE ?? BRL_PER_USD_RATE)

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "BRL_PER_USD_RATE must be a positive number."
    )
  }

  let skip = 0
  let updatedCount = 0
  let skippedCount = 0

  while (true) {
    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "title", "variants.id", "variants.title"],
      pagination: { skip, take: PAGE_SIZE },
    })
    const products = data as Product[]
    const variants = products.flatMap((product) =>
      (product.variants ?? []).filter((variant) => variant !== null).map((variant) => ({
        ...variant,
        productTitle: product.title,
      }))
    )

    if (!variants.length) {
      if (products.length < PAGE_SIZE) {
        break
      }
      skip += PAGE_SIZE
      continue
    }

    const { data: linksData } = await query.graph({
      entity: "product_variant_price_set",
      fields: ["variant_id", "price_set_id"],
      filters: { variant_id: variants.map((variant) => variant.id) },
      pagination: { take: variants.length },
    })
    const links = linksData as VariantPriceSetLink[]
    const priceSetIds = [...new Set(links.map((link) => link.price_set_id))]

    const { data: priceSetsData } = priceSetIds.length
      ? await query.graph({
          entity: "price_set",
          fields: [
            "id",
            "prices.id",
            "prices.amount",
            "prices.currency_code",
            "prices.min_quantity",
            "prices.max_quantity",
          ],
          filters: { id: priceSetIds },
          pagination: { take: priceSetIds.length },
        })
      : { data: [] }
    const priceSets = priceSetsData as PriceSet[]
    const priceSetById = new Map(
      priceSets.map((priceSet) => [priceSet.id, priceSet])
    )
    const priceSetIdByVariant = new Map(
      links.map((link) => [link.variant_id, link.price_set_id])
    )
    const updates: {
      id: string
      prices: {
        id?: string
        amount: number
        currency_code: string
        min_quantity?: number | null
        max_quantity?: number | null
      }[]
    }[] = []

    for (const variant of variants) {
      const priceSetId = priceSetIdByVariant.get(variant.id)
      const priceSet = priceSetId ? priceSetById.get(priceSetId) : undefined
      const prices = (priceSet?.prices ?? []).filter(
        (price): price is Price => price !== null
      )

      if (!prices.length) {
        skippedCount += 1
        continue
      }

      const hasUsdPrice = prices.some(
        (price) => price.currency_code.toLowerCase() === "usd"
      )
      const brlPrice = prices.find(
        (price) => price.currency_code.toLowerCase() === "brl"
      )

      if (hasUsdPrice) {
        continue
      }

      if (!brlPrice) {
        skippedCount += 1
        logger.warn(
          `Skipping variant "${variant.title}" (${variant.id}) of "${variant.productTitle}": no BRL price is set.`
        )
        continue
      }

      updates.push({
        id: variant.id,
        prices: [
          ...prices.map((price) => ({
            id: price.id,
            amount: price.amount,
            currency_code: price.currency_code,
            ...(price.min_quantity != null
              ? { min_quantity: price.min_quantity }
              : {}),
            ...(price.max_quantity != null
              ? { max_quantity: price.max_quantity }
              : {}),
          })),
          {
            amount: convertBrlToUsd(brlPrice.amount, rate),
            currency_code: "usd",
          },
        ],
      })
    }

    for (let index = 0; index < updates.length; index += UPDATE_BATCH_SIZE) {
      const batch = updates.slice(index, index + UPDATE_BATCH_SIZE)
      await updateProductVariantsWorkflow(container).run({
        input: { product_variants: batch },
      })
      updatedCount += batch.length
    }

    if (products.length < PAGE_SIZE) {
      break
    }
    skip += PAGE_SIZE
  }

  logger.info(
    `Added USD prices to ${updatedCount} variant(s) using R$ ${rate.toFixed(2)} per USD. Skipped ${skippedCount} variant(s) without a BRL price set. Existing USD prices were preserved.`
  )
}
