import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })
  const hasDiscount =
    !!cheapestPrice &&
    cheapestPrice.original_price_number > cheapestPrice.calculated_price_number
  const listingBadge =
    typeof product.metadata?.listingBadge === "string"
      ? product.metadata.listingBadge
      : undefined

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block h-full"
    >
      <div
        data-testid="product-wrapper"
        className="h-full overflow-hidden rounded-2xl border border-white/10 bg-[#1a103a] p-3 text-white shadow-[0_14px_30px_-22px_rgba(0,0,0,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:border-pink-400/60 hover:shadow-[0_20px_42px_-22px_rgba(236,72,153,0.45)] small:p-4"
      >
        <div className="relative">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            alt={product.title}
            size="full"
            aspectRatio={isFeatured ? "featured" : "card"}
            className="rounded-xl border border-white/10 bg-[#0f0a22] p-2 shadow-none"
            imageClassName="object-contain"
          />
          {hasDiscount && (
            <span className="absolute left-2 top-2 rounded bg-pink-700 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
              -{cheapestPrice.percentage_diff}%
            </span>
          )}
          {listingBadge && (
            <span className="absolute right-0 top-2 bg-emerald-700 px-2.5 py-1.5 text-[10px] font-extrabold leading-none tracking-wide text-white shadow-[0_4px_14px_rgba(5,150,105,0.55)]">
              {listingBadge}
            </span>
          )}
        </div>
        <div className="mt-3 line-clamp-2 min-h-10 text-left text-xs font-extrabold uppercase leading-4 text-white transition group-hover:text-pink-200 small:text-sm">
          <Text className="text-inherit" data-testid="product-title">
            {product.title}
          </Text>
        </div>
        <div className="mt-3 flex min-h-[3.5rem] flex-col items-start justify-center border-t border-white/10 pt-2">
          <div className="flex flex-col items-start gap-y-0.5">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
