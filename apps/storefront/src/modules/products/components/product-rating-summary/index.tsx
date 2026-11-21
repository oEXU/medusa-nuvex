import { getMockReviews } from "@lib/data/mock-reviews"
import { calculateAverageRating } from "./rating"

const STAR_PATH =
  "M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L1.5 7.7l5.9-.9L10 1.5z"

const RatingStars = ({ rating }: { rating: number }) => (
  <div
    className="flex items-center gap-1"
    role="img"
    aria-label={`${rating.toFixed(2)} de 5.00 estrelas`}
  >
    {Array.from({ length: 5 }, (_, index) => {
      const fill = Math.min(Math.max(rating - index, 0), 1)

      return (
        <svg
          key={index}
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="h-5 w-5"
        >
          <path d={STAR_PATH} fill="#e2e8f0" />
          <path
            d={STAR_PATH}
            fill="#fbbf24"
            style={{ clipPath: `inset(0 ${100 - fill * 100}% 0 0)` }}
          />
        </svg>
      )
    })}
  </div>
)

const ProductRatingSummary = ({
  productHandle,
}: {
  productHandle: string
}) => {
  const reviews = getMockReviews(productHandle)
  const rating = calculateAverageRating(reviews.map((review) => review.rating))

  return (
    <section
      aria-labelledby="product-rating-title"
      className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      data-testid="product-rating-summary"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2
            id="product-rating-title"
            className="text-sm font-semibold text-slate-900"
          >
            Avaliação dos clientes
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {reviews.length
              ? `${reviews.length} ${
                  reviews.length === 1 ? "avaliação" : "avaliações"
                }`
              : "Ainda não há avaliações"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold tabular-nums text-slate-900">
            {rating.toFixed(2)}
          </span>
          <div className="space-y-1">
            <RatingStars rating={rating} />
            <p className="text-xs text-slate-500">de 5.00</p>
          </div>
        </div>
      </div>
      {reviews.length > 0 && (
        <a
          className="mt-3 inline-block text-xs font-semibold text-pink-700 hover:text-pink-800"
          href="#product-reviews"
        >
          Ver avaliações
        </a>
      )}
    </section>
  )
}

export default ProductRatingSummary
