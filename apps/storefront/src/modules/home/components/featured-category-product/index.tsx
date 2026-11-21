"use client"

import { addToCart } from "@lib/data/cart"
import { getProductPrice } from "@lib/util/get-product-price"
import { isVariantInStock } from "@lib/util/inventory"
import { resolveImageUrl } from "@lib/util/image-url"
import { notifyCartUpdated } from "@lib/util/cart-events"
import type { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useState } from "react"

import PixIcon from "@modules/common/components/pix-icon"

export default function FeaturedCategoryProduct({
  product,
  className = "",
}: {
  product: HttpTypes.StoreProduct
  className?: string
}) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const variant = product.variants?.length === 1 ? product.variants[0] : null
  const canAddToCart = !!variant && isVariantInStock(variant)
  const isSoldOut = !!variant && !canAddToCart
  const price = getProductPrice({ product }).cheapestPrice
  const hasDiscount =
    !!price && price.original_price_number > price.calculated_price_number
  const discount = hasDiscount ? Number.parseInt(price.percentage_diff, 10) : 0
  const image = product.thumbnail || product.images?.[0]?.url
  const placeholderColor =
    typeof product.metadata?.imagePlaceholderColor === "string"
      ? product.metadata.imagePlaceholderColor
      : undefined
  const unavailableLabel =
    product.metadata?.mock === true ? "Indisponível no momento" : "Indisponível"
  const listingBadge =
    typeof product.metadata?.listingBadge === "string"
      ? product.metadata.listingBadge
      : undefined
  const isBestSeller = Boolean(listingBadge)
  const cardBackgroundClass = isSoldOut ? "bg-[#3a103a]" : "bg-[#1a103a]"

  const handleAddToCart = async () => {
    if (!variant || !canAddToCart) {
      return
    }

    setIsAdding(true)
    setAdded(false)
    setErrorMessage(null)

    try {
      await addToCart({
        variantId: variant.id,
        quantity: 1,
        countryCode,
      })
      notifyCartUpdated()
      setAdded(true)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar o produto ao carrinho.",
      )
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <li
      className={`${className} group relative flex h-full flex-col overflow-hidden rounded-2xl border ${cardBackgroundClass} p-3 text-white shadow-[0_14px_30px_-22px_rgba(0,0,0,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_-22px_rgba(236,72,153,0.45)] small:p-4 ${
        isBestSeller
          ? "border-emerald-500/70 shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_16px_34px_-22px_rgba(16,185,129,0.5)] hover:border-emerald-400"
          : isSoldOut
            ? "border-rose-500/50 hover:border-rose-400"
            : "border-white/10 hover:border-pink-400/60"
      }`}
    >
      {isBestSeller && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600"
        />
      )}
      <div className="relative">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className={`relative block aspect-[1.15] overflow-hidden rounded-xl border bg-[#0f0a22] ${
            isSoldOut ? "border-rose-500/40" : "border-white/10"
          }`}
          aria-label={`Ver detalhes de ${product.title}`}
        >
          {image ? (
            <Image
              src={resolveImageUrl(image)}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
              className="object-contain p-2"
            />
          ) : placeholderColor ? (
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ backgroundColor: placeholderColor }}
            />
          ) : (
            <span className="flex h-full items-center justify-center bg-white/5 text-xs font-medium text-slate-400">
              Imagem em breve
            </span>
          )}
        </LocalizedClientLink>
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded bg-pink-700 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
            -{discount}%
          </span>
        )}
        {listingBadge && (
          <span className="absolute right-0 top-2 bg-emerald-700 px-2.5 py-1.5 text-[10px] font-extrabold leading-none tracking-wide text-white shadow-[0_4px_14px_rgba(5,150,105,0.55)]">
            {listingBadge}
          </span>
        )}
      </div>

      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="mt-3 line-clamp-2 min-h-10 text-left text-xs font-extrabold uppercase leading-4 text-white transition hover:text-pink-200 small:text-sm"
      >
        {product.title}
      </LocalizedClientLink>

      <div className="mt-3 flex min-h-[3.5rem] flex-col items-start justify-center border-t border-white/10 pt-2">
        {hasDiscount && (
          <p className="text-xs text-slate-400 line-through">
            {price.original_price}
          </p>
        )}
        <p
          className={`flex items-center gap-1.5 text-lg font-extrabold ${
            hasDiscount ? "text-orange-400" : "text-white"
          }`}
        >
          {price?.calculated_price ?? "Consulte o preço"}
          {price && <PixIcon className="h-4 w-4 shrink-0" />}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {canAddToCart ? (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            data-testid={`add-${product.handle}-to-cart`}
            className="inline-flex min-h-10 items-center justify-center bg-pink-700 px-3 text-xs font-bold text-white transition hover:bg-pink-600 disabled:opacity-60"
          >
            {isAdding
              ? "Adicionando..."
              : added
                ? "Adicionado ao carrinho"
                : "Adicionar ao carrinho"}
          </button>
        ) : isSoldOut ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex min-h-10 cursor-not-allowed items-center justify-center border border-rose-500/40 bg-rose-500/15 px-3 text-xs font-bold text-rose-200 opacity-80"
          >
            {unavailableLabel}
          </button>
        ) : (
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="inline-flex min-h-10 items-center justify-center border border-pink-500/40 bg-pink-500/10 px-3 text-xs font-bold text-pink-200 transition hover:bg-pink-500/20"
          >
            {product.variants && product.variants.length > 1
              ? "Escolher opções"
              : unavailableLabel}
          </LocalizedClientLink>
        )}
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="inline-flex min-h-9 items-center justify-center border border-white/15 px-3 text-xs font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/[0.06]"
        >
          Ver informações
        </LocalizedClientLink>
      </div>
      {errorMessage && (
        <p role="alert" className="mt-2 text-center text-xs text-rose-300">
          {errorMessage}
        </p>
      )}
    </li>
  )
}
