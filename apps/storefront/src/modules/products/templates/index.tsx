import React, { Suspense } from "react"

import { getSocialProof } from "@lib/data/mock-social-proof"
import { isLaunchProduct } from "@lib/data/mock-launch"
import ProductLaunchCountdown from "@modules/products/components/product-launch-countdown"
import ProductImageGallery from "@modules/products/components/image-gallery/product-image-gallery"
import ProductRatingSummary from "@modules/products/components/product-rating-summary"
import ProductPlatformSelector from "@modules/products/components/product-platform-selector"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductReviews from "@modules/products/components/product-reviews"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const isMock = product.metadata?.mock === true
  const socialProof = getSocialProof(product.handle)
  const showLaunchCountdown = isLaunchProduct(product.handle)
  const productDescription = showLaunchCountdown
    ? product.description?.replace(
        "para PlayStation 5",
        "para PlayStation 5 e Xbox Series X|S"
      )
    : product.description

  return (
    <>
      <div
        className="bg-gradient-to-b from-violet-50/80 via-slate-50 to-white"
      >
        <div
          className="content-container grid grid-cols-1 gap-6 py-6 md:gap-8 md:py-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]"
          data-testid="product-container"
        >
          <section className="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-5">
            <ProductImageGallery product={product} />
            <ProductRatingSummary productHandle={product.handle ?? ""} />
          </section>
          <aside className="min-w-0 space-y-4 lg:sticky lg:top-32 lg:self-start">
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
              <ProductInfo
                product={product}
                description={productDescription}
              />
              <Suspense fallback={null}>
                <ProductPlatformSelector productHandle={product.handle} />
              </Suspense>
              <ProductOnboardingCta />
              {showLaunchCountdown && (
                <div className="mt-5">
                  <ProductLaunchCountdown countryCode={countryCode} />
                </div>
              )}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <ProductActions
                  product={product}
                  region={region}
                  disabled={isMock}
                  socialProof={socialProof}
                />
              </div>
            </section>
            <section className="rounded-3xl border border-slate-200/80 bg-white px-5 shadow-sm sm:px-7">
              <ProductTabs product={product} />
            </section>
          </aside>
        </div>
      </div>
      {showLaunchCountdown && (
        <section
          aria-label="Showcase de Grand Theft Auto VI"
          className="content-container my-10"
        >
          <div className="relative mx-auto aspect-video w-full max-w-[898px] overflow-hidden rounded-xl bg-black">
            <iframe
              className="absolute inset-0 h-full w-full"
              width="898"
              height="505"
              src="https://www.youtube.com/embed/bKtzm6iBSds"
              title="Grand Theft Auto VI - Showcase - PS5 Official Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>
      )}
      <ProductReviews productHandle={product.handle ?? ""} />
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
