"use client"

import { addToCart } from "@lib/data/cart"
import { getProductPrice } from "@lib/util/get-product-price"
import { isVariantInStock } from "@lib/util/inventory"
import { notifyCartUpdated } from "@lib/util/cart-events"
import type { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useState } from "react"

export default function FeaturedCategoryProduct({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const variant = product.variants?.length === 1 ? product.variants[0] : null
  const canAddToCart = !!variant && isVariantInStock(variant)
  const price = getProductPrice({ product }).cheapestPrice
  const hasDiscount =
    !!price && price.original_price_number > price.calculated_price_number
  const discount = hasDiscount ? Number.parseInt(price.percentage_diff, 10) : 0
  const image = product.thumbnail || product.images?.[0]?.url

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
    <li className="group relative flex h-full flex-col overflow-hidden border border-slate-300 bg-white p-3 text-slate-950 transition-colors duration-200 hover:border-fuchsia-600 small:p-4">
      <div className="relative">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="relative block aspect-[1.15] overflow-hidden border-b border-slate-100 bg-white"
          aria-label={`Ver detalhes de ${product.title}`}
        >
          {image ? (
            <Image
              src={image}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
              className="object-contain p-2"
            />
          ) : (
            <span className="flex h-full items-center justify-center bg-slate-50 text-xs font-medium text-slate-400">
              Imagem em breve
            </span>
          )}
        </LocalizedClientLink>
        {discount > 0 && (
          <span className="absolute left-0 top-2 bg-[#ffb34d] px-2 py-1 text-[10px] font-extrabold leading-none text-slate-950">
            -{discount}%
          </span>
        )}
      </div>

      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="mt-3 line-clamp-2 min-h-10 text-left text-xs font-extrabold uppercase leading-4 text-slate-950 transition hover:text-fuchsia-700 small:text-sm"
      >
        {product.title}
      </LocalizedClientLink>

      <div className="mt-3 flex min-h-[3.5rem] flex-col items-start justify-center border-t border-slate-100 pt-2">
        {hasDiscount && (
          <p className="text-xs text-slate-500 line-through">
            {price.original_price}
          </p>
        )}
        <p
          className={`text-lg font-extrabold ${
            hasDiscount ? "text-orange-600" : "text-slate-950"
          }`}
        >
          {price?.calculated_price ?? "Consulte o preço"}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-3">
        {canAddToCart ? (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="inline-flex min-h-10 items-center justify-center border border-pink-700 bg-pink-700 px-3 text-xs font-bold text-white transition hover:border-pink-600 hover:bg-pink-600 disabled:cursor-wait disabled:opacity-70"
          >
            {isAdding
              ? "Adicionando..."
              : added
                ? "Adicionado ao carrinho"
                : "Adicionar ao carrinho"}
          </button>
        ) : (
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="inline-flex min-h-10 items-center justify-center border border-pink-700 bg-pink-700 px-3 text-xs font-bold text-white transition hover:border-pink-600 hover:bg-pink-600"
          >
            {product.variants && product.variants.length > 1
              ? "Escolher opções"
              : "Indisponível"}
          </LocalizedClientLink>
        )}
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="inline-flex min-h-9 items-center justify-center border border-slate-300 px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
        >
          Ver informações
        </LocalizedClientLink>
      </div>
      {errorMessage && (
        <p role="alert" className="mt-2 text-center text-xs text-rose-700">
          {errorMessage}
        </p>
      )}
    </li>
  )
}
