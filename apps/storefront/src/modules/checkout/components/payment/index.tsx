"use client"
import { RadioGroup } from "@headlessui/react"
import { getPaymentInfo, isBlackcat, isStripeLike } from "@lib/constants"
import { initiatePaymentSession, placeOrder } from "@lib/data/cart"
import { getBlackcatCheckoutUrl } from "@lib/util/blackcat-checkout"
import { getBlackcatOriginToken } from "@lib/util/blackcat-origin"
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

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: { id: string }[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession) =>
      paymentSession.status === "pending" ||
      paymentSession.status === "pending_authorization"
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
  const blackcatPaymentMethod = configuredPaymentMethods.find(({ id }) =>
    isBlackcat(id)
  )
  const cardPaymentMethod = configuredPaymentMethods.find(({ id }) =>
    isStripeLike(id)
  )
  const cardPaymentMethods = configuredPaymentMethods.filter(({ id }) =>
    isStripeLike(id)
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
        let data: Record<string, unknown> | undefined
        if (isBlackcat(selectedPaymentMethod)) {
          const originToken = await getBlackcatOriginToken()
          const address = cart.shipping_address ?? cart.billing_address
          const customerName = [address?.first_name, address?.last_name]
            .filter((part): part is string => typeof part === "string" && !!part.trim())
            .join(" ")
          const cpf = cart.metadata?.cpf
          data = {
            originToken,
            items: (cart.items ?? []).map((item) => ({
              title: item.product_title || item.title,
              unitPrice: Math.round(Number(item.unit_price) * 100),
              quantity: item.quantity,
              tangible: item.requires_shipping !== false && item.metadata?.media_type !== "digital",
            })),
            shipping: cart.shipping_address ? {
              name: customerName,
              street: cart.shipping_address.address_1 ?? "",
              number: cart.shipping_address.address_2 ?? cart.shipping_address.address_1?.match(/\b\d+[a-zA-Z]?\b/)?.[0] ?? "",
              complement: cart.shipping_address.address_2 ?? "",
              neighborhood: typeof cart.shipping_address.metadata?.neighborhood === "string"
                ? cart.shipping_address.metadata.neighborhood
                : cart.shipping_address.address_2 ?? "",
              city: cart.shipping_address.city ?? "",
              state: cart.shipping_address.province ?? "",
              zipCode: cart.shipping_address.postal_code?.replace(/\D/g, "") ?? "",
            } : undefined,
            customer: {
              name: customerName,
              email: cart.email,
              phone: address?.phone ?? "",
              document: {
                number: typeof cpf === "string" ? cpf : "",
                type: "cpf",
              },
            },
          }
        }
        const result = await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
          ...(data ? { data } : {}),
        })
        if (isBlackcat(selectedPaymentMethod)) {
          const session = result.payment_collection.payment_sessions?.find(
            ({ provider_id }) => isBlackcat(provider_id)
          )
          const checkoutUrl = getBlackcatCheckoutUrl(session?.data?.invoiceUrl)
          if (!session || !checkoutUrl) {
            throw new Error("A BlackCat não retornou uma URL válida de checkout.")
          }
          await placeOrder(cart.id, countryCode, checkoutUrl)
          return
        }
        router.refresh()
      }
      return
    } catch (err) {
      if (
        err !== null &&
        typeof err === "object" &&
        "digest" in err &&
        typeof err.digest === "string" &&
        err.digest.startsWith("NEXT_REDIRECT")
      ) {
        throw err
      }
      if (isBlackcat(selectedPaymentMethod)) {
        router.refresh()
      }
      setError(
        isBlackcat(selectedPaymentMethod)
          ? "Não foi possível iniciar o Pix agora. Confira seus dados e tente novamente."
          : err instanceof Error ? err.message : String(err)
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const methods =
    currencyCode === "brl"
      ? [
          { label: "PIX", icon: <PixIcon /> },
          {
            label: "Cartão de crédito",
            icon: <CreditCard className="h-5 w-5 shrink-0 text-slate-700" />,
            isCreditCard: true,
          },
        ]
      : [
          {
            label: "PIX",
            icon: <PixIcon />,
          },
          {
            label: "Cartão de crédito",
            icon: <CreditCard className="h-5 w-5 shrink-0 text-slate-700" />,
            isCreditCard: true,
          },
        ]

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
      {isSupportedCheckoutCurrency && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {methods.map((method) => {
            if (method.label === "PIX" && blackcatPaymentMethod) {
              return (
                <button
                  type="button"
                  key={method.label}
                  onClick={() => setPaymentMethod(blackcatPaymentMethod.id)}
                  aria-pressed={selectedPaymentMethod === blackcatPaymentMethod.id}
                  className={clx(
                    "flex w-full items-center gap-2.5 rounded-2xl border px-4 py-4 text-left text-sm text-slate-800 transition-all",
                    selectedPaymentMethod === blackcatPaymentMethod.id
                      ? "border-fuchsia-500 bg-fuchsia-50"
                      : "border-slate-200 bg-white hover:border-fuchsia-300"
                  )}
                >
                  {method.icon}
                  <span className="font-medium text-slate-900">{method.label}</span>
                </button>
              )
            }

            if (
              "isCreditCard" in method &&
              method.isCreditCard &&
              cardPaymentMethod
            ) {
              return (
                <button
                  type="button"
                  key={method.label}
                  onClick={() => setPaymentMethod(cardPaymentMethod.id)}
                  aria-pressed={selectedPaymentMethod === cardPaymentMethod.id}
                  className={clx(
                    "flex w-full items-center gap-2.5 rounded-2xl border px-4 py-4 text-left text-sm text-slate-800 transition-all",
                    selectedPaymentMethod === cardPaymentMethod.id
                      ? "border-fuchsia-500 bg-fuchsia-50"
                      : "border-slate-200 bg-white hover:border-fuchsia-300"
                  )}
                >
                  {method.icon}
                  <span className="font-medium text-slate-900">{method.label}</span>
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
      )}
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && configuredPaymentMethods?.length && (
            <>
              <RadioGroup
                value={
                  cardPaymentMethods.some(
                    ({ id }) => id === selectedPaymentMethod
                  )
                    ? selectedPaymentMethod
                    : ""
                }
                onChange={(value: string) => setPaymentMethod(value)}
              >
                {cardPaymentMethods.map((paymentMethod) => (
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

          {isBlackcat(selectedPaymentMethod) && !activeSession && (
            <fieldset className="mt-5 grid gap-3 sm:grid-cols-2">
              <legend className="mb-2 text-sm font-medium text-slate-700">
                Escolha como deseja pagar com Pix
              </legend>
              <div className="flex items-start gap-3 rounded-xl border border-fuchsia-300 bg-fuchsia-50 p-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-[5px] border-fuchsia-600 outline outline-1 outline-fuchsia-600"
                />
                <span>
                  <strong>Checkout Seguro - NuveX</strong>
                  <br />
                  <small>Continue no ambiente seguro de pagamento.</small>
                </span>
              </div>
            </fieldset>
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
