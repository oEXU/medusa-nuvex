import { HttpTypes } from "@medusajs/types"
import { Heading } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductDescription from "@modules/products/components/product-description"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
  description?: string | null
}

const ProductInfo = ({ product, description = product.description }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-3">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="w-fit rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700 transition hover:bg-pink-100"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h1"
          className="text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <ProductDescription description={description} />
      </div>
    </div>
  )
}

export default ProductInfo
