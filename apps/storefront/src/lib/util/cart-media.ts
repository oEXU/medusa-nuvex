import type { HttpTypes } from "@medusajs/types"

export type CartMediaType = "physical" | "digital"

const GTA_VI_MEDIA_HANDLES = new Set([
  "grand-theft-auto-vi-ultimate-edition-primaria",
  "grand-theft-auto-vi-ultimate-edition-secundaria",
])

const isGtaViItem = (item: HttpTypes.StoreCartLineItem) =>
  (item.product_handle && GTA_VI_MEDIA_HANDLES.has(item.product_handle)) ||
  (!!item.product?.handle && GTA_VI_MEDIA_HANDLES.has(item.product.handle))

export const isDigitalGtaViItem = (item: HttpTypes.StoreCartLineItem) =>
  isGtaViItem(item) &&
  item.requires_shipping === false &&
  item.metadata?.media_type === "digital"

export const hasCartMediaChoice = (
  cart: Pick<HttpTypes.StoreCart, "items"> | null | undefined
) => {
  const items = cart?.items ?? []

  return items.length > 0 && items.every(isGtaViItem)
}

export const isDigitalOnlyCart = (
  cart: Pick<HttpTypes.StoreCart, "items"> | null | undefined
) => {
  const items = cart?.items ?? []

  return items.length > 0 && items.every(isDigitalGtaViItem)
}

export const canSelectCartMediaType = (
  cart: Pick<HttpTypes.StoreCart, "items"> | null | undefined,
  mediaType: CartMediaType
) => {
  const items = cart?.items ?? []

  return (
    hasCartMediaChoice(cart) &&
    items.every((item) => {
      if (isGtaViItem(item)) {
        return true
      }

      return mediaType === "digital"
        ? item.requires_shipping === false
        : item.requires_shipping !== false
    })
  )
}
