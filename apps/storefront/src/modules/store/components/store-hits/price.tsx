"use client"

import { indexedCurrency, priceAttribute } from "@lib/search-client"
import { getPercentageDiff } from "@lib/util/get-percentage-diff"
import { convertToLocale } from "@lib/util/money"
import { Text, clx } from "@modules/common/components/ui"

/** The per-currency price fields a hit may carry, e.g. `min_price_eur`. */
export type HitPricing = Record<string, unknown>

type HitPriceProps = {
  hit: HitPricing
  currencyCode: string
}

const amount = (value: unknown) => (typeof value === "number" ? value : null)

const HitPrice = ({ hit, currencyCode }: HitPriceProps) => {
  const currency_code = indexedCurrency(currencyCode)
  const min_price = amount(hit[priceAttribute("min_price", currencyCode)])
  const max_price = amount(hit[priceAttribute("max_price", currencyCode)])
  const original_price = amount(
    hit[priceAttribute("original_price", currencyCode)]
  )
  const on_sale = hit[priceAttribute("on_sale", currencyCode)] === true

  if (min_price === null) {
    return null
  }

  const format = (value: number) =>
    convertToLocale({ amount: value, currency_code })

  const max = max_price ?? min_price
  const isRange = max > min_price
  const hasDiscount =
    !isRange &&
    on_sale &&
    original_price !== null &&
    original_price > min_price

  return (
    <div className="flex items-center gap-x-2" data-testid="product-price">
      {hasDiscount && original_price !== null && (
        <Text
          className="line-through text-ui-fg-muted"
          data-testid="original-price"
        >
          {format(original_price)}
        </Text>
      )}
      <Text
        className={clx("text-ui-fg-muted", {
          "text-ui-tag-red-text": hasDiscount,
        })}
        data-testid="price"
      >
        {isRange ? `${format(min_price)} - ${format(max)}` : format(min_price)}
      </Text>
      {hasDiscount && original_price !== null && (
        <Text
          className="rounded bg-pink-700 px-1.5 py-0.5 text-xs font-bold text-white"
          data-testid="discount-percentage"
        >
          -{getPercentageDiff(original_price, min_price)}%
        </Text>
      )}
    </div>
  )
}

export default HitPrice
