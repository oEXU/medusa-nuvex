"use client"

import type { ProductReview } from "@lib/data/mock-reviews"
import Image from "next/image"
import { FormEvent, useState } from "react"

const MAX_STARS = 5
const REVIEWS_PAGE_SIZE = 6

function clampRating(rating: number) {
  return Math.min(Math.max(rating, 1), MAX_STARS)
}

function UserPhotoIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-5 8-5s8 1.7 8 5" />
    </svg>
  )
}

const STAR_PATH =
  "M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L1.5 7.7l5.9-.9L10 1.5z"

function StarRating({ rating }: { rating: number }) {
  const value = clampRating(rating)

  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${value.toFixed(1)} de ${MAX_STARS} estrelas`}
    >
      {Array.from({ length: MAX_STARS }, (_, index) => {
        const fill = Math.min(Math.max(value - index, 0), 1)
        return (
          <svg
            key={index}
            viewBox="0 0 20 20"
            className="h-4 w-4"
            aria-hidden="true"
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
}

function StarPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (rating: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const highlighted = hovered || value

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Nota da avaliação"
      onMouseLeave={() => setHovered(0)}
    >
      {Array.from({ length: MAX_STARS }, (_, index) => {
        const star = index + 1
        const filled = star <= highlighted
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} ${star === 1 ? "estrela" : "estrelas"}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            className="rounded p-0.5 transition hover:scale-110"
          >
            <svg
              viewBox="0 0 20 20"
              className={`h-4 w-4 ${filled ? "text-amber-400" : "text-gray-300"}`}
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={STAR_PATH} />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <li className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-500">
          {review.avatar ? (
            <Image
              src={review.avatar}
              alt={`Foto de ${review.author}`}
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserPhotoIcon />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {review.author}
          </p>
          <StarRating rating={review.rating} />
          {review.orderNumber && (
            <p className="text-xs text-gray-400">
              Pedido #{review.orderNumber}
            </p>
          )}
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-gray-600">{review.message}</p>
    </li>
  )
}

export default function ProductReviewsClient({
  initialReviews,
}: {
  initialReviews: ProductReview[]
}) {
  const [reviews, setReviews] = useState(initialReviews)
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PAGE_SIZE)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setOrderNumber("")
    setRating(0)
    setMessage("")
    setError(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!orderNumber.trim() || !message.trim() || rating < 1) {
      setError("Informe o número do pedido, a nota e a sua avaliação.")
      return
    }

    const review: ProductReview = {
      id: `review-${Date.now()}`,
      author: "Você",
      orderNumber: orderNumber.trim(),
      rating,
      message: message.trim(),
    }

    setReviews((previous) => [review, ...previous])
    resetForm()
    setIsFormOpen(false)
  }

  const handleCancel = () => {
    resetForm()
    setIsFormOpen(false)
  }

  return (
    <section
      id="product-reviews"
      className="content-container py-12 small:py-16"
      data-testid="product-reviews"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Avaliações</h2>
          <span className="text-sm text-gray-500">
            {reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsFormOpen((open) => !open)
            setError(null)
          }}
          aria-expanded={isFormOpen}
          aria-controls="review-form"
          className="inline-flex min-h-10 items-center justify-center gap-2 border border-pink-700 bg-pink-700 px-4 text-xs font-bold text-white transition hover:border-pink-600 hover:bg-pink-600"
        >
          <span aria-hidden="true" className="text-base leading-none">
            +
          </span>
          Criar avaliação
        </button>
      </div>

      {isFormOpen && (
        <form
          id="review-form"
          onSubmit={handleSubmit}
          className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5"
        >
          <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-semibold text-gray-900">
              Número do pedido
              <input
                type="text"
                inputMode="numeric"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                placeholder="Ex.: 12345"
                className="min-h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal text-gray-900 outline-none focus:border-pink-600"
              />
            </label>
            <div className="flex flex-col gap-1 text-sm font-semibold text-gray-900">
              <span>Sua nota</span>
              <StarPicker value={rating} onChange={setRating} />
            </div>
          </div>

          <label className="flex flex-col gap-1 text-sm font-semibold text-gray-900">
            Sua avaliação
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              placeholder="Conte como foi sua experiência com o produto"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-pink-600"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-rose-700">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex min-h-10 items-center justify-center border border-pink-700 bg-pink-700 px-5 text-xs font-bold text-white transition hover:border-pink-600 hover:bg-pink-600"
            >
              Publicar avaliação
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex min-h-10 items-center justify-center border border-gray-300 bg-white px-5 text-xs font-semibold text-gray-700 transition hover:border-gray-500 hover:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <ul className="grid grid-cols-1 gap-4 small:grid-cols-2 medium:grid-cols-3">
        {reviews.slice(0, visibleCount).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </ul>

      {visibleCount < reviews.length && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((count) => count + REVIEWS_PAGE_SIZE)
            }
            className="inline-flex min-h-10 items-center justify-center border border-gray-300 bg-white px-6 text-xs font-bold text-gray-700 transition hover:border-gray-500 hover:bg-gray-100"
          >
            Ver mais
          </button>
        </div>
      )}
    </section>
  )
}