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
    <div className="flex flex-col items-start">
      {hasDiscount && (
        <Text
          className="text-xs text-slate-400 line-through"
          data-testid="original-price"
        >
          {price.original_price}
        </Text>
      )}
      <div className="flex items-center gap-1.5">
        <Text
          className={clx("text-lg font-extrabold", {
            "text-orange-400": hasDiscount,
            "text-white": !hasDiscount,
          })}
          data-testid="price"
        >
          {price.calculated_price}
        </Text>
        <PixIcon className="h-4 w-4 shrink-0 text-teal-400" />
      </div>
    </div>
  )
}
