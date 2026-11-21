import { Text, clx } from "@modules/common/components/ui"
import PixIcon from "@modules/common/components/pix-icon"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  const hasDiscount =
    price.price_type === "sale" &&
    price.original_price_number > price.calculated_price_number

  return (
    <>
      {hasDiscount && (
        <Text
          className="line-through text-ui-fg-muted"
          data-testid="original-price"
        >
          {price.original_price}
        </Text>
      )}
      <div className="flex items-center gap-1">
        <Text
          className={clx("text-ui-fg-muted", {
            "text-ui-fg-interactive": hasDiscount,
          })}
          data-testid="price"
        >
          {price.calculated_price}
        </Text>
        <PixIcon className="h-3.5 w-3.5 shrink-0" />
      </div>
      {hasDiscount && (
        <Text
          className="rounded bg-pink-700 px-1.5 py-0.5 text-xs font-bold text-white"
          data-testid="discount-percentage"
        >
          -{price.percentage_diff}%
        </Text>
      )}
    </>
  )
}
