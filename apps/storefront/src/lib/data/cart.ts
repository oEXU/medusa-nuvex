"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCartId,
  revalidateCacheTag,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"
import { getLocale, setLocaleCookie } from "./locale-actions"
import {
  canSelectCartMediaType,
  type CartMediaType,
} from "@lib/util/cart-media"

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string, fields?: string) {
  const id = cartId || (await getCartId())
  fields ??= [
    "id",
    "region_id",
    "metadata",
    "email",
    "shipping_address.*",
    "billing_address.*",
    "currency_code",
    "total",
    "subtotal",
    "tax_total",
    "discount_total",
    "discount_subtotal",
    "original_total",
    "item_total",
    "item_subtotal",
    "item_tax_total",
    "item_discount_total",
    "original_item_total",
    "original_item_subtotal",
    "shipping_total",
    "shipping_subtotal",
    "shipping_tax_total",
    "shipping_discount_total",
    "customer_id",
    "*items",
    "items.total",
    "items.subtotal",
    "items.original_total",
    "items.discount_total",
    "items.requires_shipping",
    "*region.countries",
    "*items.product",
    "items.product.metadata",
    "*items.variant",
    "*items.thumbnail",
    "*items.metadata",
    "*promotions",
    "shipping_methods.name",
  ].join(",")

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields,
      },
      headers,
      cache: "no-store",
    })
    .then(({ cart }: { cart: HttpTypes.StoreCart }) => cart)
    .catch(() => null)
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart(undefined, "id,region_id")

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!cart) {
    const locale = await getLocale()
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id, locale: locale || undefined },
      {},
      headers
    )
    cart = cartResp.cart

    await setCartId(cart.id)

    await revalidateCacheTag("carts")
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    await revalidateCacheTag("carts")
  }

  return cart
}

export async function syncCartRegion(countryCode: string) {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const [cart, region] = await Promise.all([
    retrieveCart(cartId, "id,region_id"),
    getRegion(countryCode),
  ])

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cart && cart.region_id !== region.id) {
    await updateCart({
      region_id: region.id,
      shipping_address: { country_code: countryCode },
      billing_address: { country_code: countryCode },
    })
  }
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }: { cart: HttpTypes.StoreCart }) => {
      await revalidateCacheTag("carts")

      await revalidateCacheTag("fulfillment")

      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
  mediaType,
}: {
  variantId: string
  quantity: number
  countryCode: string
  mediaType?: CartMediaType
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)

  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
        ...(mediaType ? { metadata: { media_type: mediaType } } : {}),
      },
      {},
      headers
    )
    .then(async () => {
      await revalidateCacheTag("carts")

      await revalidateCacheTag("fulfillment")
    })
    .catch(medusaError)
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, headers)
    .then(async () => {
      await revalidateCacheTag("carts")

      await revalidateCacheTag("fulfillment")
    })
    .catch(medusaError)
}

export async function updateLineItemMediaType({
  lineId,
  mediaType,
}: {
  lineId: string
  mediaType: CartMediaType
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating media type")
  }

  if (mediaType !== "physical" && mediaType !== "digital") {
    throw new Error("Invalid media type")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating media type")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const { cart } = await sdk.client.fetch<HttpTypes.StoreCartResponse>(
    `/store/carts/${cartId}`,
    {
      method: "GET",
      query: {
        fields: "id,*items,*items.metadata,*items.product,items.product.metadata",
      },
      headers,
      cache: "no-store",
    }
  )

  const item = cart.items?.find((lineItem) => lineItem.id === lineId)
  const currentMediaType = item?.metadata?.media_type
  const productSupportsMediaChoices =
    item?.product?.metadata?.media_fisica_digital === true
  const hasMediaChoice =
    currentMediaType === "physical" || currentMediaType === "digital"

  if (!item || (!productSupportsMediaChoices && !hasMediaChoice)) {
    throw new Error("Cart item does not support a media choice")
  }

  await sdk.client
    .fetch(`/store/carts/${cartId}/delivery-mode`, {
      method: "POST",
      body: { media_type: mediaType, item_id: lineId },
      headers,
      cache: "no-store",
    })
    .then(async () => {
      await revalidateCacheTag("carts")
      await revalidateCacheTag("fulfillment")
    })
    .catch(medusaError)
}

export async function setCartDeliveryMode({
  mediaType,
}: {
  mediaType: CartMediaType
}) {
  if (mediaType !== "physical" && mediaType !== "digital") {
    throw new Error("Invalid media type")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when setting delivery mode")
  }

  const cart = await retrieveCart(cartId)

  if (!cart) {
    throw new Error("Cart not found when setting delivery mode")
  }

  if (!canSelectCartMediaType(cart, mediaType)) {
    throw new Error(
      mediaType === "digital"
        ? "A mídia digital só está disponível quando todos os itens do carrinho permitem essa opção."
        : "A mídia física não está disponível para um ou mais itens do carrinho."
    )
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.client
    .fetch(`/store/carts/${cartId}/delivery-mode`, {
      method: "POST",
      body: { media_type: mediaType },
      headers,
      cache: "no-store",
    })
    .then(async () => {
      await revalidateCacheTag("carts")
      await revalidateCacheTag("fulfillment")
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, {}, headers)
    .then(async () => {
      await revalidateCacheTag("carts")

      await revalidateCacheTag("fulfillment")
    })
    .catch(medusaError)
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async () => {
      await revalidateCacheTag("carts")
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, headers)
    .then(async (resp) => {
      await revalidateCacheTag("carts")
      return resp
    })
    .catch(medusaError)
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, { promo_codes: codes }, {}, headers)
    .then(async () => {
      await revalidateCacheTag("carts")

      await revalidateCacheTag("fulfillment")
    })
    .catch(medusaError)
}

export async function applyGiftCard(_code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(_code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  _codeToRemove: string,
  _giftCards: unknown[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = await getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const getValue = (name: string) => {
      const value = formData.get(name)
      return typeof value === "string" ? value.trim() : ""
    }

    const countryCode = getValue("shipping_address.country_code").toLowerCase()
    const cpf = getValue("cpf").replace(/\D/g, "")
    const email = getValue("email")
    const requiredFields = [
      "shipping_address.first_name",
      "shipping_address.last_name",
      "shipping_address.address_1",
      "shipping_address.postal_code",
      "shipping_address.city",
      "shipping_address.country_code",
      "shipping_address.phone",
      "email",
    ]

    if (requiredFields.some((field) => !getValue(field))) {
      throw new Error("Preencha todos os campos obrigatórios.")
    }

    if (countryCode === "br" && !getValue("shipping_address.address_2")) {
      throw new Error("Informe o número do endereço.")
    }

    if (countryCode === "br" && !isValidCpf(cpf)) {
      throw new Error("Informe um CPF válido.")
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Informe um endereço de e-mail válido.")
    }

    const shippingAddress = {
      first_name: getValue("shipping_address.first_name"),
      last_name: getValue("shipping_address.last_name"),
      address_1: getValue("shipping_address.address_1"),
      address_2: getValue("shipping_address.address_2"),
      company: "",
      postal_code: getValue("shipping_address.postal_code"),
      city: getValue("shipping_address.city"),
      country_code: countryCode,
      province: getValue("shipping_address.province"),
      phone: getValue("shipping_address.phone"),
    }

    const data: HttpTypes.StoreUpdateCart = {
      shipping_address: shippingAddress,
      email,
      ...(cpf ? { metadata: { cpf } } : {}),
    }

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = shippingAddress

    if (sameAsBilling !== "on") {
      data.billing_address = {
        first_name: getValue("billing_address.first_name"),
        last_name: getValue("billing_address.last_name"),
        address_1: getValue("billing_address.address_1"),
        address_2: getValue("billing_address.address_2"),
        company: "",
        postal_code: getValue("billing_address.postal_code"),
        city: getValue("billing_address.city"),
        country_code: getValue("billing_address.country_code"),
        province: getValue("billing_address.province"),
        phone: getValue("billing_address.phone"),
      }
    }
    await updateCart(data)
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }

  redirect(
    `/${formData.get("shipping_address.country_code")}/checkout?step=delivery`
  )
}

export async function setDigitalCartEmail(
  currentState: unknown,
  formData: FormData
) {
  const email = String(formData.get("email") ?? "").trim()
  const countryCode = String(formData.get("country_code") ?? "").toLowerCase()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Informe um endereço de e-mail válido."
  }

  if (!/^[a-z]{2}$/.test(countryCode)) {
    throw new Error("Código de país inválido ao salvar o e-mail.")
  }

  try {
    await updateCart({ email })
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }

  redirect(`/${countryCode}/checkout?step=payment`)
}

function isValidCpf(cpf: string) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  const digits = cpf.split("").map(Number)
  const calculateDigit = (length: number) => {
    const sum = digits
      .slice(0, length)
      .reduce((total, digit, index) => total + digit * (length + 1 - index), 0)
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  return calculateDigit(9) === digits[9] && calculateDigit(10) === digits[10]
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @param fallbackCountryCode - Used when a digital order has no shipping address.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(
  cartId?: string,
  fallbackCountryCode?: string
) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const cartRes = await sdk.store.cart
    .complete(id, {}, headers)
    .then(async (cartRes) => {
      await revalidateCacheTag("carts")
      return cartRes
    })
    .catch(medusaError)

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase() ||
      fallbackCountryCode?.toLowerCase()

    if (!countryCode) {
      throw new Error("Missing country code when redirecting to the order")
    }

    await revalidateCacheTag("orders")

    removeCartId()
    redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
  }

  return cartRes.cart
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(
  countryCode: string,
  currentPath: string,
  localeCode?: string
) {
  const normCountry = (countryCode || "br").toLowerCase()
  const cartId = await getCartId()
  const region = await getRegion(normCountry)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (localeCode) {
    await setLocaleCookie(localeCode)
  }

  if (cartId) {
    await updateCart({
      region_id: region.id,
      shipping_address: { country_code: normCountry },
      billing_address: { country_code: normCountry },
      ...(localeCode ? { locale: localeCode } : {}),
    })
  }

  await revalidateCacheTag("regions")

  await revalidateCacheTag("products")

  redirect(`/${normCountry}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("shippingOptions")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next,
    headers,
    cache: "force-cache",
  })
}
