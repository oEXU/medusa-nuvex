"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState } from "react"
import { resolveImageUrl } from "@lib/util/image-url"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  placeholderColor?: string
  productTitle: string
}

const ImageGallery = ({
  images,
  placeholderColor,
  productTitle,
}: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const validImages = images.filter(
    (image): image is HttpTypes.StoreProductImage & { url: string } =>
      typeof image.url === "string" && image.url.length > 0
  )

  if (!validImages.length) {
    return (
      <div
        className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-slate-50 text-sm text-slate-500"
        style={
          placeholderColor ? { backgroundColor: placeholderColor } : undefined
        }
      >
        {!placeholderColor && "Imagem em breve"}
      </div>
    )
  }

  const activeIndex = selectedIndex < validImages.length ? selectedIndex : 0
  const activeImage = validImages[activeIndex] ?? validImages[0]
  const mainImage = (
    <div
      className="relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-violet-50"
      style={
        placeholderColor ? { backgroundColor: placeholderColor } : undefined
      }
    >
      <Image
        key={activeImage.id ?? activeImage.url}
        src={resolveImageUrl(activeImage.url)}
        alt={`${productTitle} - imagem ${activeIndex + 1}`}
        className="object-contain p-5 sm:p-8"
        fill
        sizes="(max-width: 1023px) 100vw, (max-width: 1440px) 58vw, 800px"
        priority
        data-testid="product-main-image"
      />
    </div>
  )

  if (validImages.length === 1) {
    return mainImage
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-[76px_minmax(0,1fr)] lg:gap-4">
      <div
        className="order-2 flex w-full max-w-full snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 lg:order-1 lg:max-h-[70vh] lg:min-h-0 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0 lg:[&::-webkit-scrollbar]:h-0 lg:[&::-webkit-scrollbar]:w-1.5"
        role="group"
        aria-label="Imagens do produto"
      >
        {validImages.map((image, index) => (
          <button
            key={image.id ?? `${image.url}-${index}`}
            type="button"
            aria-label={`Ver imagem ${index + 1} de ${productTitle}`}
            aria-pressed={activeIndex === index}
            onClick={() => setSelectedIndex(index)}
            className={`relative h-16 w-16 shrink-0 snap-start overflow-hidden rounded-xl border bg-white p-1 transition-colors lg:h-[76px] lg:w-[76px] ${
              activeIndex === index
                ? "border-pink-600 ring-2 ring-pink-100"
                : "border-slate-200 hover:border-pink-300"
            }`}
          >
            <Image
              src={resolveImageUrl(image.url)}
              alt=""
              className="object-contain"
              fill
              sizes="76px"
            />
          </button>
        ))}
      </div>
      <div className="order-1 min-w-0 lg:order-2">{mainImage}</div>
    </div>
  )
}

export default ImageGallery
