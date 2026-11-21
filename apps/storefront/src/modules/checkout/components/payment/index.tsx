"use client"
import { RadioGroup } from "@headlessui/react"
import { getPaymentInfo, isStripeLike } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, {
  StripePaymentContainer,
} from "@modules/checkout/components/payment-container"
import PaymentButton from "@modules/checkout/components/payment-button"
import Divider from "@modules/common/components/divider"
import {
  Button,
  Container,
  Heading,
  Text,
  clx,
} from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import { isDigitalOnlyCart } from "@lib/util/cart-media"
import Image from "next/image"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import { translate } from "@lib/util/store-locale"
import { useCallback, useEffect, useState } from "react"

const PixIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="535 28 76 75"
    className="h-5 w-5 shrink-0"
    fill="none"
  >
    <path
      d="m596.827 86.62c-3.08 0-5.978-1.2-8.156-3.377l-11.777-11.777c-.827-.829-2.268-.827-3.095 0L561.98 83.286c-2.178 2.177-5.076 3.377-8.156 3.377h-2.321l14.916 14.915c4.658 4.658 12.211 4.658 16.869 0l14.958-14.958z"
      fill="#32bcad"
    />
    <path
      d="M553.824 44.963c3.08 0 5.978 1.2 8.156 3.377L573.8 60.162c.851.852 2.241.855 3.095 0l11.777-11.778c2.178-2.178 5.076-3.377 8.156-3.377h1.419l-14.958-14.958c-4.659-4.658-12.211-4.658-16.869 0l-14.915 14.915z"
      fill="#32bcad"
    />
    <path
      d="m610.618 57.379-9.039-9.039a1.75 1.75 0 0 1-.642.129h-4.11c-2.125 0-4.205.862-5.706 2.364l-11.776 11.777a5.65 5.65 0 0 1-7.994.001l-11.821-11.821c-1.501-1.503-3.581-2.364-5.706-2.364h-5.054c-.216 0-.417-.051-.607-.122l-9.075 9.075c-4.659 4.658-4.659 12.211 0 16.869l9.075 9.075c.19-.072.392-.122.607-.122h5.054c2.125 0 4.205-.862 5.706-2.364l11.82-11.82c2.136-2.135 5.861-2.135 7.995.001l11.776 11.776c1.501 1.502 3.581 2.364 5.706 2.364h4.11c.227 0 .443.05.642.129l9.039-9.039c4.658-4.658 4.658-12.211 0-16.869"
      fill="#32bcad"
    />
  </svg>
)

const MercadoPagoIcon = () => (
  <Image
    src="/mercado-pago.png"
    alt="Mercado Pago"
    width={20}
    height={20}
    className="h-5 w-5 shrink-0 object-contain"
  />
)

const BitcoinIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 32 32" className="h-5 w-5 shrink-0">
    <circle cx="16" cy="16" r="16" fill="#f7931a" />
    <text
      x="16"
      y="22"
      fill="white"
      fontFamily="Arial, sans-serif"
      fontSize="21"
      fontWeight="900"
      textAnchor="middle"
      transform="rotate(12 16 16)"
    >
      ₿
    </text>
  </svg>
)

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: { id: string }[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { countryCode } = useParams<{ countryCode: string }>()
  const digitalOnly = isDigitalOnlyCart(cart)

  const isOpen = searchParams.get("step") === "payment"
  const currencyCode = cart.currency_code?.toLowerCase()
  const isSupportedCheckoutCurrency =
    currencyCode === "brl" || currencyCode === "usd"
  const configuredPaymentMethods = availablePaymentMethods.filter(
    ({ id }) => !id.startsWith("pp_system_default")
  )

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    if (isStripeLike(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
      })
    }
  }

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])
      ?.length > 0 &&
    cart?.total === 0
  )

  const paymentReady =
    (activeSession &&
      (digitalOnly || (cart?.shipping_methods?.length ?? 0) !== 0)) ||
    paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
      }
      return
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const handleMercadoPagoRedirect = () => {
    const productTitle =
      cart.items && cart.items.length > 0
        ? cart.items
            .map((item) => item.product_title || item.title)
            .filter(Boolean)
            .join(", ")
        : "Grand Theft Auto VI"

    const rawTotal = cart.total ?? cart.subtotal ?? cart.item_subtotal ?? 0
    const priceInCents = Math.round(rawTotal * 100)

    const payload = {
      productName: productTitle,
      priceInCents: priceInCents > 0 ? priceInCents : 12990,
      totalAmount: rawTotal > 0 ? rawTotal : 129.9,
      cartId: cart.id,
      items: cart.items?.map((item) => ({
        id: item.id,
        title: item.product_title || item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      })),
      generatedAt: new Date().toISOString(),
    }

    try {
      sessionStorage.setItem("mp_checkout_data", JSON.stringify(payload))
      localStorage.setItem("mp_checkout_data", JSON.stringify(payload))
    } catch (_) {}

    const params = new URLSearchParams()
    params.set("productName", payload.productName)
    params.set("priceInCents", String(payload.priceInCents))
    if (cart.id) params.set("cartId", cart.id)

    const baseUrl = process.env.NEXT_PUBLIC_MP_CHECKOUT_URL || "/mp-checkout/index.html"
    const targetUrl = `${baseUrl}?${params.toString()}`
    window.location.assign(new URL(targetUrl, window.location.origin).href)
  }

  if (isSupportedCheckoutCurrency && configuredPaymentMethods.length === 0) {
    const methods =
      currencyCode === "brl"
        ? [
            { label: "PIX", icon: <PixIcon /> },
            {
              label: "PIX Mercado Pago",
              icon: <MercadoPagoIcon />,
              isAction: true,
              onClick: handleMercadoPagoRedirect,
            },
            {
              label: "Cartão de crédito",
              icon: <CreditCard className="h-5 w-5 shrink-0 text-slate-700" />,
              isCreditCard: true,
            },
            { label: "Bitcoin", icon: <BitcoinIcon /> },
          ]
        : [
            {
              label: "Cartão de crédito (Stripe)",
              icon: <CreditCard className="h-5 w-5 shrink-0 text-slate-700" />,
              isCreditCard: true,
            },
            { label: "Bitcoin", icon: <BitcoinIcon /> },
          ]

    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-700">
            {countryCode === "us" ? "Checkout · step 3" : "Checkout · etapa 3"}
          </p>
          <Heading
            level="h2"
            className="text-2xl font-semibold tracking-tight text-slate-900"
          >
            {translate(countryCode, "payment")}
          </Heading>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-base-semi text-ui-fg-base">
            {translate(countryCode, "paymentSetupPending")}
          </p>
          <p className="mt-1 text-small-regular text-ui-fg-subtle">
            {translate(countryCode, "paymentUnavailable")}
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {methods.map((method) => {
            if ("isAction" in method && method.isAction) {
              return (
                <button
                  type="button"
                  key={method.label}
                  onClick={method.onClick}
                  className="group flex w-full items-center justify-between rounded-2xl border border-sky-300 bg-sky-50/30 px-4 py-4 text-sm text-slate-800 shadow-xs transition-all hover:border-[#009ee3] hover:bg-sky-50/70 hover:shadow-md active:scale-[0.99] cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#009ee3]/40"
                >
                  <span className="flex items-center gap-2.5 font-medium text-slate-900">
                    {method.icon}
                    {method.label}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-[#009ee3] px-3 py-1 text-xs font-semibold text-white shadow-xs transition-colors group-hover:bg-[#007cb4]">
                    Pagar com Pix
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </button>
              )
            }

            return (
              <div
                key={method.label}
                aria-disabled="true"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700"
              >
                <span className="flex items-center gap-2.5">
                  {method.icon}
                  {method.label}
                </span>
                <span
                  className={
                    "isCreditCard" in method && method.isCreditCard
                      ? "rounded-full bg-red-100 px-2.5 py-1 text-xs text-red-800"
                      : "rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-800"
                  }
                >
                  {translate(
                    countryCode,
                    "isCreditCard" in method && method.isCreditCard
                      ? "paymentUnavailableStatus"
                      : "paymentPending"
                  )}
                </span>
              </div>
            )
          })}
        </div>
        <Divider className="mt-8" />
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-row items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-700">
            {countryCode === "us" ? "Checkout · step 3" : "Checkout · etapa 3"}
          </p>
          <Heading
            level="h2"
            className={clx(
              "flex flex-row items-center gap-x-2 text-2xl font-semibold tracking-tight text-slate-900",
              {
                "opacity-50 pointer-events-none select-none":
                  !isOpen && !paymentReady,
              }
            )}
          >
            {translate(countryCode, "payment")}
            {!isOpen && paymentReady && <CheckCircleSolid />}
          </Heading>
        </div>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-payment-button"
            >
              {translate(countryCode, "edit")}
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && configuredPaymentMethods?.length && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
              >
                {configuredPaymentMethods.map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                    {isStripeLike(paymentMethod.id) ? (
                      <StripePaymentContainer
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                        setError={setError}
                        setPaymentComplete={setPaymentComplete}
                      />
                    ) : (
                      <PaymentContainer
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      />
                    )}
                  </div>
                ))}
              </RadioGroup>
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                {translate(countryCode, "paymentMethod")}
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                {translate(countryCode, "giftCard")}
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          {activeSession || paidByGiftcard ? (
            <div className="mt-6">
              <PaymentButton
                cart={cart}
                data-testid="submit-order-button"
              />
            </div>
          ) : (
            <Button
              size="large"
              className="mt-6"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={
                !cart.email ||
                (isStripeLike(selectedPaymentMethod) && !paymentComplete) ||
                (!selectedPaymentMethod && !paidByGiftcard)
              }
              data-testid="submit-payment-button"
            >
              {isStripeLike(selectedPaymentMethod)
                ? translate(countryCode, "enterPaymentDetails")
                : countryCode === "us"
                  ? "Continue"
                  : "Continuar"}
            </Button>
          )}
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  {translate(countryCode, "paymentMethod")}
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {getPaymentInfo(activeSession?.provider_id)?.title ||
                    activeSession?.provider_id}
                </Text>
              </div>
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  {translate(countryCode, "paymentDetails")}
                </Text>
                <div
                  className="flex gap-2 txt-medium text-ui-fg-subtle items-center"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                    {getPaymentInfo(selectedPaymentMethod)?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text>{translate(countryCode, "anotherStep")}</Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                {translate(countryCode, "paymentMethod")}
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                {translate(countryCode, "giftCard")}
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </section>
  )
}

export default Payment
