"use client"
import { Radio, RadioGroup } from "@headlessui/react"
import { setCartDeliveryMode, setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import {
  canSelectCartMediaType,
  hasCartMediaChoice,
  isDigitalOnlyCart,
  type CartMediaType,
} from "@lib/util/cart-media"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import DigitalContact from "@modules/checkout/components/digital-contact"
import Divider from "@modules/common/components/divider"
import MedusaRadio from "@modules/common/components/radio"
import { Button, clx, Heading, Text } from "@modules/common/components/ui"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import { translate } from "@lib/util/store-locale"
import { useEffect, useState } from "react"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

function formatAddress(address: HttpTypes.StoreCartAddress) {
  if (!address) {
    return ""
  }

  let ret = ""

  if (address.address_1) {
    ret += ` ${address.address_1}`
  }

  if (address.address_2) {
    ret += `, ${address.address_2}`
  }

  if (address.postal_code) {
    ret += `, ${address.postal_code} ${address.city}`
  }

  if (address.country_code) {
    ret += `, ${address.country_code.toUpperCase()}`
  }

  return ret
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)

  const [showPickupOptions, setShowPickupOptions] =
    useState<string>(PICKUP_OPTION_OFF)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [error, setError] = useState<string | null>(null)
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { countryCode } = useParams<{ countryCode: string }>()
  const isEnglish = countryCode === "us"

  const digitalOnly = isDigitalOnlyCart(cart)
  const hasMediaChoice = hasCartMediaChoice(cart)
  const selectedMediaType: CartMediaType = digitalOnly ? "digital" : "physical"
  const canSelectPhysical = canSelectCartMediaType(cart, "physical")
  const canSelectDigital = canSelectCartMediaType(cart, "digital")
  const currentStep = searchParams.get("step")
  const isOpen =
    currentStep === "delivery" ||
    (digitalOnly &&
      !!cart.shipping_address &&
      (!cart.email || currentStep === "contact" || currentStep === null))
  const deliveryComplete = digitalOnly
    ? !!cart.shipping_address && !!cart.email
    : (cart.shipping_methods?.length ?? 0) > 0

  const _shippingMethods = availableShippingMethods?.filter(
    (sm) =>
      (
        sm as unknown as {
          service_zone?: {
            fulfillment_set?: {
              type?: string
              location?: { address: HttpTypes.StoreCartAddress }
            }
          }
        }
      ).service_zone?.fulfillment_set?.type !== "pickup"
  )

  const _pickupMethods = availableShippingMethods?.filter(
    (sm) =>
      (
        sm as unknown as {
          service_zone?: {
            fulfillment_set?: {
              type?: string
              location?: { address: HttpTypes.StoreCartAddress }
            }
          }
        }
      ).service_zone?.fulfillment_set?.type === "pickup"
  )

  const hasPickupOptions = !!_pickupMethods?.length

  useEffect(() => {
    setIsLoadingPrices(true)

    if (_shippingMethods?.length) {
      const promises = _shippingMethods
        .filter((sm) => sm.price_type === "calculated")
        .map((sm) => calculatePriceForShippingOption(sm.id, cart.id))

      if (promises.length) {
        Promise.allSettled(promises).then((res) => {
          const pricesMap: Record<string, number> = {}
          res
            .filter((r) => r.status === "fulfilled")
            .forEach((p) => {
              if (p.value?.id) {
                pricesMap[p.value.id] = p.value.amount ?? 0
              }
            })

          setCalculatedPricesMap(pricesMap)
          setIsLoadingPrices(false)
        })
      } else {
        setCalculatedPricesMap({})
        setIsLoadingPrices(false)
      }
    } else {
      setCalculatedPricesMap({})
      setIsLoadingPrices(false)
    }

    if (_pickupMethods?.find((m) => m.id === shippingMethodId)) {
      setShowPickupOptions(PICKUP_OPTION_ON)
    }
  }, [availableShippingMethods])

  const handleEdit = () => {
    router.push(pathname + `?step=${digitalOnly ? "contact" : "delivery"}`, {
      scroll: false,
    })
  }

  const handleSubmit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const handleSetShippingMethod = async (
    id: string,
    variant: "shipping" | "pickup"
  ) => {
    setError(null)

    if (variant === "pickup") {
      setShowPickupOptions(PICKUP_OPTION_ON)
    } else {
      setShowPickupOptions(PICKUP_OPTION_OFF)
    }

    let currentId: string | null = null
    setIsLoading(true)
    setShippingMethodId((prev) => {
      currentId = prev
      return id
    })

    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => {
        setShippingMethodId(currentId)

        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleSetDeliveryMode = async (mediaType: CartMediaType) => {
    if (mediaType === selectedMediaType) {
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      await setCartDeliveryMode({ mediaType })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-row items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-700">
            {isEnglish ? "Checkout · step 2" : "Checkout · etapa 2"}
          </p>
          <Heading
            level="h2"
            className={clx(
              "flex flex-row items-center gap-x-2 text-2xl font-semibold tracking-tight text-slate-900",
              {
                "opacity-50 pointer-events-none select-none":
                  !isOpen &&
                  !digitalOnly &&
                  cart.shipping_methods?.length === 0,
              }
            )}
          >
            {translate(countryCode, "delivery")}
            {!isOpen && deliveryComplete && <CheckCircleSolid />}
          </Heading>
          {isOpen && (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isEnglish
                ? "Choose how you would like to receive your order."
                : "Selecione como você gostaria de receber seu pedido."}
            </p>
          )}
        </div>
        {!isOpen &&
          ((digitalOnly && deliveryComplete) ||
            (cart?.shipping_address &&
              cart?.billing_address &&
              cart?.email)) && (
            <Text>
              <button
                onClick={handleEdit}
                className="rounded-lg px-3 py-2 text-sm font-medium text-fuchsia-700 transition hover:bg-fuchsia-50"
                data-testid="edit-delivery-button"
              >
                {translate(countryCode, "edit")}
              </button>
            </Text>
          )}
      </div>
      {isOpen ? (
        <>
          {hasMediaChoice && (
            <div className="space-y-3" data-testid="delivery-mode-options">
              <p className="text-sm font-semibold text-slate-800">
                {isEnglish ? "Media type" : "Tipo de mídia"}
              </p>
              <RadioGroup
                value={selectedMediaType}
                onChange={handleSetDeliveryMode}
              >
                <Radio
                  value="physical"
                  disabled={isLoading || !canSelectPhysical}
                  className={clx(
                    "flex cursor-pointer items-start gap-4 rounded-2xl border px-4 py-4 text-left transition hover:border-fuchsia-300 hover:bg-slate-50",
                    {
                      "border-fuchsia-600 bg-fuchsia-50":
                        selectedMediaType === "physical",
                      "cursor-not-allowed opacity-50":
                        isLoading || !canSelectPhysical,
                    }
                  )}
                  data-testid="physical-media-option"
                >
                  <MedusaRadio checked={selectedMediaType === "physical"} />
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">
                      {isEnglish ? "PHYSICAL MEDIA" : "MÍDIA FÍSICA"}
                    </span>
                    <span className="mt-1 text-sm text-slate-500">
                      {isEnglish
                        ? "Delivered to the address selected for this order."
                        : "Entregue no endereço escolhido para o pedido."}
                    </span>
                  </span>
                </Radio>
                <Radio
                  value="digital"
                  disabled={isLoading || !canSelectDigital}
                  className={clx(
                    "mt-3 flex cursor-pointer items-start gap-4 rounded-2xl border px-4 py-4 text-left transition hover:border-fuchsia-300 hover:bg-slate-50",
                    {
                      "border-fuchsia-600 bg-fuchsia-50":
                        selectedMediaType === "digital",
                      "cursor-not-allowed opacity-50":
                        isLoading || !canSelectDigital,
                    }
                  )}
                  data-testid="digital-media-option"
                >
                  <MedusaRadio checked={selectedMediaType === "digital"} />
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">
                      {isEnglish ? "DIGITAL MEDIA" : "MÍDIA DIGITAL"}
                    </span>
                    <span className="mt-1 text-sm text-slate-500">
                      {isEnglish
                        ? "Use the email below for the digital order."
                        : "Use o e-mail abaixo como destinatário do pedido digital."}
                    </span>
                  </span>
                </Radio>
              </RadioGroup>
              {!canSelectDigital && (
                <p className="text-sm text-slate-500">
                  {isEnglish
                    ? "Digital media is available only for products enabled for both formats."
                    : "A mídia digital só fica disponível para produtos habilitados para os dois formatos."}
                </p>
              )}
              <ErrorMessage
                error={error}
                data-testid="delivery-option-error-message"
              />
            </div>
          )}

          {digitalOnly ? (
            <DigitalContact cart={cart} />
          ) : (
            <>
              <div>
                <div data-testid="delivery-options-container">
                  <div className="space-y-3">
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {translate(countryCode, "shippingMethod")}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {translate(countryCode, "deliveryInstruction")}
                      </p>
                    </div>
                    {hasPickupOptions && (
                      <RadioGroup
                        value={showPickupOptions}
                        onChange={(_value) => {
                          const id = _pickupMethods.find(
                            (option) => !option.insufficient_inventory
                          )?.id

                          if (id) {
                            handleSetShippingMethod(id, "pickup")
                          }
                        }}
                      >
                        <Radio
                          value={PICKUP_OPTION_ON}
                          data-testid="delivery-option-radio"
                          className={clx(
                            "flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left text-sm transition hover:border-fuchsia-300 hover:bg-slate-50",
                            {
                              "border-fuchsia-600 bg-fuchsia-50":
                                showPickupOptions === PICKUP_OPTION_ON,
                            }
                          )}
                        >
                          <div className="flex items-center gap-x-4">
                            <MedusaRadio
                              checked={showPickupOptions === PICKUP_OPTION_ON}
                            />
                            <span className="text-base-regular">
                              {translate(countryCode, "pickupOrder")}
                            </span>
                          </div>
                          <span className="justify-self-end text-ui-fg-base">
                            -
                          </span>
                        </Radio>
                      </RadioGroup>
                    )}
                    <RadioGroup
                      value={shippingMethodId}
                      onChange={(v) => {
                        if (v) {
                          return handleSetShippingMethod(v, "shipping")
                        }
                      }}
                    >
                      {_shippingMethods?.map((option) => {
                        const isDisabled =
                          option.price_type === "calculated" &&
                          !isLoadingPrices &&
                          typeof calculatedPricesMap[option.id] !== "number"

                        return (
                          <Radio
                            key={option.id}
                            value={option.id}
                            data-testid="delivery-option-radio"
                            disabled={isDisabled}
                            className={clx(
                              "flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left text-sm transition hover:border-fuchsia-300 hover:bg-slate-50",
                              {
                                "border-fuchsia-600 bg-fuchsia-50":
                                  option.id === shippingMethodId,
                                "cursor-not-allowed opacity-50": isDisabled,
                              }
                            )}
                          >
                            <div className="flex items-center gap-x-4">
                              <MedusaRadio
                                checked={option.id === shippingMethodId}
                              />
                              <span className="text-base-regular">
                                {option.name}
                              </span>
                            </div>
                            <span className="justify-self-end text-ui-fg-base">
                              {option.price_type === "flat" ? (
                                convertToLocale({
                                  amount: option.amount ?? 0,
                                  currency_code: cart?.currency_code,
                                })
                              ) : calculatedPricesMap[option.id] ? (
                                convertToLocale({
                                  amount: calculatedPricesMap[option.id],
                                  currency_code: cart?.currency_code,
                                })
                              ) : isLoadingPrices ? (
                                <Loader />
                              ) : (
                                "-"
                              )}
                            </span>
                          </Radio>
                        )
                      })}
                    </RadioGroup>
                    {!availableShippingMethods?.length && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-950">
                        {isEnglish
                          ? "No delivery methods are available for this address yet. Please check back soon."
                          : "Ainda não há formas de entrega disponíveis para este endereço. Tente novamente em breve."}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {showPickupOptions === PICKUP_OPTION_ON && (
                <div className="grid">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">
                      {translate(countryCode, "store")}
                    </span>
                    <span className="mb-4 mt-1 text-sm text-slate-500">
                      {translate(countryCode, "chooseNearbyStore")}
                    </span>
                  </div>
                  <div data-testid="delivery-options-container">
                    <div className="pb-8 md:pt-0 pt-2">
                      <RadioGroup
                        value={shippingMethodId}
                        onChange={(v) => {
                          if (v) {
                            return handleSetShippingMethod(v, "pickup")
                          }
                        }}
                      >
                        {_pickupMethods?.map((option) => {
                          return (
                            <Radio
                              key={option.id}
                              value={option.id}
                              disabled={option.insufficient_inventory}
                              data-testid="delivery-option-radio"
                              className={clx(
                                "flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left text-sm transition hover:border-fuchsia-300 hover:bg-slate-50",
                                {
                                  "border-fuchsia-600 bg-fuchsia-50":
                                    option.id === shippingMethodId,
                                  "cursor-not-allowed opacity-50":
                                    option.insufficient_inventory,
                                }
                              )}
                            >
                              <div className="flex items-start gap-x-4">
                                <MedusaRadio
                                  checked={option.id === shippingMethodId}
                                />
                                <div className="flex flex-col">
                                  <span className="text-base-regular">
                                    {option.name}
                                  </span>
                                  <span className="text-base-regular text-ui-fg-muted">
                                    {formatAddress(
                                      (
                                        option as unknown as {
                                          service_zone?: {
                                            fulfillment_set?: {
                                              location?: {
                                                address: HttpTypes.StoreCartAddress
                                              }
                                            }
                                          }
                                        }
                                      ).service_zone?.fulfillment_set?.location
                                        ?.address as HttpTypes.StoreCartAddress
                                    )}
                                  </span>
                                </div>
                              </div>
                              <span className="justify-self-end text-ui-fg-base">
                                {convertToLocale({
                                  amount: option.amount ?? 0,
                                  currency_code: cart?.currency_code,
                                })}
                              </span>
                            </Radio>
                          )
                        })}
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Button
                  size="large"
                  className="mt-6 w-full sm:w-auto sm:min-w-64"
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  disabled={!cart.shipping_methods?.[0]}
                  data-testid="submit-delivery-option-button"
                >
                  {translate(countryCode, "continuePayment")}
                </Button>
              </div>
            </>
          )}
        </>
      ) : (
        <div>
          <div className="text-small-regular">
            {digitalOnly && cart.email && (
              <div className="flex flex-col">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  {isEnglish ? "Delivery type" : "Tipo de entrega"}
                </Text>
                <Text className="txt-medium text-ui-fg-subtle">
                  {isEnglish ? "Digital media" : "Mídia digital"} · {cart.email}
                </Text>
              </div>
            )}
            {!digitalOnly &&
              cart &&
              (cart.shipping_methods?.length ?? 0) > 0 && (
                <div className="flex flex-col w-1/3">
                  <Text className="txt-medium-plus text-ui-fg-base mb-1">
                    {translate(countryCode, "method")}
                  </Text>
                  <Text className="txt-medium text-ui-fg-subtle">
                    {cart.shipping_methods!.at(-1)!.name}{" "}
                    {convertToLocale({
                      amount: cart.shipping_methods!.at(-1)!.amount ?? 0,
                      currency_code: cart?.currency_code,
                    })}
                  </Text>
                </div>
              )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </section>
  )
}

export default Shipping
