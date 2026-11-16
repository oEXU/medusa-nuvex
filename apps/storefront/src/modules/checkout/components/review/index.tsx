"use client"

import { Heading, Text, clx } from "@modules/common/components/ui"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { useParams } from "next/navigation"
import { translate } from "@lib/util/store-locale"
import { isDigitalOnlyCart } from "@lib/util/cart-media"

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const searchParams = useSearchParams()
  const { countryCode } = useParams<{ countryCode: string }>()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])
      ?.length > 0 &&
    cart?.total === 0
  )
  const currencyCode = cart.currency_code?.toLowerCase()
  const digitalOnly = isDigitalOnlyCart(cart)
  const requiresConfiguredPayment = ["brl", "usd"].includes(currencyCode ?? "")
  const hasConfiguredPaymentSession =
    cart.payment_collection?.payment_sessions?.some(
      (session) =>
        session.status === "pending" &&
        !session.provider_id.startsWith("pp_system_default")
    ) ?? false

  const previousStepsCompleted =
    (digitalOnly ||
      (cart.shipping_address && (cart.shipping_methods?.length ?? 0) > 0)) &&
    !!cart.email &&
    (paidByGiftcard ||
      (cart.payment_collection &&
        (!requiresConfiguredPayment || hasConfiguredPaymentSession)))

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-700">
          {countryCode === "us"
            ? "Checkout · step 4"
            : "Checkout · etapa 4"}
        </p>
        <Heading
          level="h2"
          className={clx(
            "flex flex-row items-center gap-x-2 text-2xl font-semibold tracking-tight text-slate-900",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          {translate(countryCode, "review")}
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="mb-6 w-full">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Text className="text-sm leading-6 text-slate-700">
                {translate(countryCode, "placeOrderNotice")}
              </Text>
            </div>
          </div>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      )}
    </section>
  )
}

export default Review
