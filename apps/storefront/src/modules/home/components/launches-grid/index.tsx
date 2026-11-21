"use client"

import { useEffect, useState } from "react"

import type { HttpTypes } from "@medusajs/types"
import { subscribeToCategorySelected } from "@lib/util/category-events"
import { translate } from "@lib/util/store-locale"
import FeaturedCategoryProduct from "@modules/home/components/featured-category-product"

function getCategoryKeys(product: HttpTypes.StoreProduct) {
  const categoryKeys = product.metadata?.categoryKeys

  return Array.isArray(categoryKeys)
    ? categoryKeys.filter((key): key is string => typeof key === "string")
    : []
}

function withCategoryImage(
  product: HttpTypes.StoreProduct,
  categoryId: string | null,
) {
  const imageByCategory = product.metadata?.imageByCategory

  if (
    !categoryId ||
    !imageByCategory ||
    typeof imageByCategory !== "object"
  ) {
    return product
  }

  const image = (imageByCategory as Record<string, unknown>)[categoryId]

  if (typeof image !== "string" || !image) {
    return product
  }

  return {
    ...product,
    thumbnail: image,
    images: [{ id: `${product.id}-image`, url: image, rank: 0 }],
  } as HttpTypes.StoreProduct
}

export default function LaunchesGrid({
  products,
  countryCode,
}: {
  products: HttpTypes.StoreProduct[]
  countryCode: string
}) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  useEffect(() => {
    const syncFromHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace("#", ""))

      setActiveCategoryId(hash || null)
    }

    syncFromHash()
    window.addEventListener("hashchange", syncFromHash)
    window.addEventListener("popstate", syncFromHash)

    const unsubscribe = subscribeToCategorySelected((categoryId) =>
      setActiveCategoryId(categoryId),
    )

    return () => {
      window.removeEventListener("hashchange", syncFromHash)
      window.removeEventListener("popstate", syncFromHash)
      unsubscribe()
    }
  }, [])

  const visibleProducts = products
    .filter((product) => {
      if (!activeCategoryId) {
        return true
      }

      const categoryKeys = getCategoryKeys(product)

      return !categoryKeys.length || categoryKeys.includes(activeCategoryId)
    })
    .map((product) => withCategoryImage(product, activeCategoryId))

  if (!visibleProducts.length) {
    return (
      <p className="text-sm text-slate-400">
        {translate(countryCode, "catalogPreparing")}
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-3 small:grid-cols-2 medium:grid-cols-3 large:grid-cols-4">
      {visibleProducts.map((product) => (
        <FeaturedCategoryProduct key={product.id} product={product} />
      ))}
    </ul>
  )
}