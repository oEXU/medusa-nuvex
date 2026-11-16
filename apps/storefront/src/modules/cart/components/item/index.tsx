"use client"

import { Table, Text, clx } from "@modules/common/components/ui"
import { updateLineItem, updateLineItemMediaType } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import type { CartMediaType } from "@lib/util/cart-media"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"
import { useParams } from "next/navigation"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingMediaType, setUpdatingMediaType] = useState(false)
  const [mediaTypeError, setMediaTypeError] = useState<string | null>(null)
  const { countryCode } = useParams<{ countryCode: string }>()
  const storedMediaType = item.metadata?.media_type
  const productSupportsMediaChoices =
    item.product?.metadata?.media_fisica_digital === true
  const supportsMediaChoices =
    productSupportsMediaChoices ||
    storedMediaType === "physical" ||
    storedMediaType === "digital"
  const mediaType: CartMediaType =
    storedMediaType === "digital" ? "digital" : "physical"
  const isEnglish = countryCode === "us"

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const changeMediaType = async (nextMediaType: CartMediaType) => {
    if (!supportsMediaChoices || nextMediaType === mediaType) {
      return
    }

    setMediaTypeError(null)
    setUpdatingMediaType(true)

    await updateLineItemMediaType({
      lineId: item.id,
      mediaType: nextMediaType,
    })
      .catch((err) => {
        setMediaTypeError(err.message)
      })
      .finally(() => {
        setUpdatingMediaType(false)
      })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        {supportsMediaChoices && (
          <div className="mt-2">
            {type === "full" ? (
              <label className="flex items-center gap-2 text-sm text-ui-fg-subtle">
                <span>{isEnglish ? "Format" : "Formato"}:</span>
                <select
                  value={mediaType}
                  onChange={(event) => {
                    const value = event.target.value
                    if (value === "physical" || value === "digital") {
                      changeMediaType(value)
                    }
                  }}
                  disabled={updatingMediaType}
                  className="rounded-lg border border-ui-border-base bg-white px-3 py-2 text-ui-fg-base disabled:opacity-50"
                  aria-label={isEnglish ? "Media format" : "Formato de mídia"}
                  data-testid="cart-item-media-type"
                >
                  <option value="physical">
                    {isEnglish ? "Physical" : "Física"}
                  </option>
                  <option value="digital">Digital</option>
                </select>
                {updatingMediaType && <Spinner />}
              </label>
            ) : (
              <Text className="text-small-regular text-ui-fg-subtle">
                {isEnglish ? "Format" : "Formato"}:{" "}
                {mediaType === "digital"
                  ? "Digital"
                  : isEnglish
                    ? "Physical"
                    : "Física"}
              </Text>
            )}
            {type === "full" && (
              <ErrorMessage
                error={mediaTypeError}
                data-testid="cart-item-media-type-error"
              />
            )}
          </div>
        )}
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex gap-2 items-center w-28">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
            <CartItemSelect
              value={item.quantity}
              onChange={(value) => changeQuantity(parseInt(value.target.value))}
              className="w-14 h-10 p-4"
              data-testid="product-select-button"
            >
              {/* TODO: Update this with the v2 way of managing inventory */}
              {Array.from(
                {
                  length: Math.min(maxQuantity, 10),
                },
                (_, i) => (
                  <option value={i + 1} key={i}>
                    {i + 1}
                  </option>
                )
              )}

              <option value={1} key={1}>
                1
              </option>
            </CartItemSelect>
            {updating && <Spinner />}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
