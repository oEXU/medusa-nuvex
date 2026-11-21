"use client"

import { isAdyen, isManual, isStripeLike } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { isDigitalOnlyCart } from "@lib/util/cart-media"
import { Button } from "@modules/common/components/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import { useParams } from "next/navigation"
import React, { useState } from "react"
import ErrorMessage from "../error-message"
import { getPaymentErrorMessage } from "@lib/util/payment-error"
import AdyenPaymentButton from "./adyen-payment-button"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const digitalOnly = isDigitalOnlyCart(cart)
  const notReady =
    !cart ||
    !cart.email ||
    (!digitalOnly &&
      (!cart.shipping_address ||
        !cart.billing_address ||
        (cart.shipping_methods?.length ?? 0) < 1))

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]
  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])
      ?.length > 0 &&
    cart?.total === 0
  )

  switch (true) {
    case paidByGiftcard:
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isAdyen(paymentSession?.provider_id):
      return (
        <AdyenPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      return <Button disabled>Select a payment method</Button>
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { countryCode } = useParams<{ countryCode: string }>()

  const onPaymentCompleted = async () => {
    await placeOrder(undefined, countryCode)
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    if (!stripe || !elements || !cart) {
      return
    }

    setSubmitting(true)

    await stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/api/payment-return?cart_id=${cart.id}&country_code=${countryCode}`,
          payment_method_data: {
            billing_details: {
              email: cart.email,
                ...(cart.billing_address
                  ? {
                      name: [
                        cart.billing_address.first_name,
                        cart.billing_address.last_name,
                      ]
                        .filter(Boolean)
                        .join(" "),
                      address: {
                        city: cart.billing_address.city ?? undefined,
                        country: cart.billing_address.country_code ?? undefined,
                        line1: cart.billing_address.address_1 ?? undefined,
                        line2: cart.billing_address.address_2 ?? undefined,
                        postal_code:
                          cart.billing_address.postal_code ?? undefined,
                        state: cart.billing_address.province ?? undefined,
                      },
                      phone: cart.billing_address.phone ?? undefined,
                    }
                  : {}),
            },
          },
        },
        // Only leave the site when the selected method actually requires it, so
        // card payments still complete inline.
        redirect: "if_required",
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
            return
          }

          setErrorMessage(getPaymentErrorMessage(error))
          setSubmitting(false)
          return
        }

        if (
          paymentIntent.status === "requires_capture" ||
          paymentIntent.status === "succeeded"
        ) {
          onPaymentCompleted()
          return
        }

        setSubmitting(false)
      })
      .catch((error) => {
        setErrorMessage(getPaymentErrorMessage(error))
        setSubmitting(false)
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        {countryCode === "us" ? "Place order" : "Finalizar pedido"}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { countryCode } = useParams<{ countryCode: string }>()

  const onPaymentCompleted = async () => {
    await placeOrder(undefined, countryCode)
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        {countryCode === "us" ? "Place order" : "Finalizar pedido"}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
