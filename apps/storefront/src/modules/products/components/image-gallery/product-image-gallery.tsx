import { HttpTypes } from "@medusajs/types"
import ImageGallery from "."

const ProductImageGallery = ({
  product,
}: {
  product: HttpTypes.StoreProduct
}) => {
  const placeholderColor =
    typeof product.metadata?.imagePlaceholderColor === "string"
      ? product.metadata.imagePlaceholderColor
      : undefined

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : product.thumbnail
        ? [
            {
              id: `${product.id}-thumbnail`,
              url: product.thumbnail,
            } as HttpTypes.StoreProductImage,
          ]
        : []

  return (
    <ImageGallery
      images={productImages}
      placeholderColor={placeholderColor}
      productTitle={product.title}
    />
  )
}

export default ProductImageGallery
