import { getMockReviews } from "@lib/data/mock-reviews"
import ProductReviewsClient from "./client"

export default function ProductReviews({
  productHandle,
}: {
  productHandle: string
}) {
  const reviews = getMockReviews(productHandle)

  if (!reviews.length) {
    return null
  }

  return <ProductReviewsClient initialReviews={reviews} />
}