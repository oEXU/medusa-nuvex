"use client"

import { isLaunchProduct } from "@lib/data/mock-launch"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useSearchParams } from "next/navigation"

const ProductPlatformSelector = ({
  productHandle,
}: {
  productHandle: string | null | undefined
}) => {
  const searchParams = useSearchParams()

  if (!isLaunchProduct(productHandle) || !productHandle) {
    return null
  }

  const selectedPlatform =
    searchParams.get("platform") === "xbox" ? "xbox" : "ps5"

  return (
    <div className="mt-5" aria-labelledby="product-platform-label">
      <p
        id="product-platform-label"
        className="text-sm font-semibold text-slate-900"
      >
        Plataforma
      </p>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <LocalizedClientLink
          href={`/products/${productHandle}?platform=ps5`}
          aria-current={selectedPlatform === "ps5" ? "page" : undefined}
          className={`flex min-h-11 items-center justify-center rounded-lg border px-3 text-center text-sm font-semibold transition ${
            selectedPlatform === "ps5"
              ? "border-pink-700 bg-pink-50 text-pink-800"
              : "border-slate-200 text-slate-700 hover:border-pink-400"
          }`}
        >
          PlayStation 5
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/products/${productHandle}?platform=xbox`}
          aria-current={selectedPlatform === "xbox" ? "page" : undefined}
          className={`flex min-h-11 items-center justify-center rounded-lg border px-3 text-center text-sm font-semibold transition ${
            selectedPlatform === "xbox"
              ? "border-pink-700 bg-pink-50 text-pink-800"
              : "border-slate-200 text-slate-700 hover:border-pink-400"
          }`}
        >
          Xbox Series X|S
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default ProductPlatformSelector
