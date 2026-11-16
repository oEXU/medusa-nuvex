import { HttpTypes } from "@medusajs/types"

export type CartMediaType = "physical" | "digital"

const hasMediaChoice = (item: HttpTypes.StoreCartLineItem) =>
  item.product?.metadata?.media_fisica_digital === true ||
  item.metadata?.media_type === "physical" ||
  item.metadata?.media_type === "digital"

export const isDigitalOnlyCart = (
  cart: Pick<HttpTypes.StoreCart, "items"> | null | undefined
) => {
  const items = cart?.items ?? []

  return (
    items.length > 0 &&
    items.every(
      (item) =>
        item.requires_shipping === false &&
        item.metadata?.media_type !== "physical"
    )
  )
}

export const canSelectCartMediaType = (
  cart: Pick<HttpTypes.StoreCart, "items"> | null | undefined,
  mediaType: CartMediaType
) => {
  const items = cart?.items ?? []

  return (
    items.length > 0 &&
    items.every((item) => {
      if (hasMediaChoice(item)) {
        return true
      }

      return mediaType === "digital"
        ? item.requires_shipping === false
        : item.requires_shipping !== false
    })
  )
}
