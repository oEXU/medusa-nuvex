import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { isDigitalOnlyCart } from "@lib/util/cart-media"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const digitalOnly = isDigitalOnlyCart(cart)
  const [shippingMethods, paymentMethods] = await Promise.all([
    digitalOnly ? Promise.resolve([]) : listCartShippingMethods(cart.id),
    listCartPaymentMethods(cart.region?.id ?? ""),
  ])

  if ((!digitalOnly && !shippingMethods) || !paymentMethods) {
    return null
  }

  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      <Addresses cart={cart} customer={customer} />

      <Shipping
        key={`${digitalOnly ? "digital" : "physical"}:${
          cart.shipping_methods?.at(-1)?.shipping_option_id ?? ""
        }`}
        cart={cart}
        availableShippingMethods={shippingMethods ?? []}
      />

      <Payment cart={cart} availablePaymentMethods={paymentMethods} />

      <Review cart={cart} />
    </div>
  )
}
