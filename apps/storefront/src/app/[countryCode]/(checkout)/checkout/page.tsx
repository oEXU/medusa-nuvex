import {
  ensurePhysicalShippingForCart,
  retrieveCart,
  syncCartRegion,
} from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  await syncCartRegion(countryCode)
  let cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  if (await ensurePhysicalShippingForCart(cart)) {
    cart = await retrieveCart(cart.id)

    if (!cart) {
      return notFound()
    }
  }

  const customer = await retrieveCustomer()

  return (
    <div className="content-container grid grid-cols-1 items-start gap-8 pb-8 pt-6 small:grid-cols-[minmax(0,1fr)_380px] small:gap-10 lg:pb-12 lg:pt-8">
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper>
      <CheckoutSummary cart={cart} countryCode={countryCode} />
    </div>
  )
}
