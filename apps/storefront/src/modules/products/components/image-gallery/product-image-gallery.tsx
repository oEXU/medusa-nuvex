import { HttpTypes } from "@medusajs/types"
import ImageGallery from "."

const ProductImageGallery = ({
  product,
}: {
  product: HttpTypes.StoreProduct
}) => {
  return <ImageGallery images={product.images ?? []} />
}

export default ProductImageGallery
