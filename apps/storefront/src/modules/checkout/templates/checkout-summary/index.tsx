import { Heading } from "@modules/common/components/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import { translate } from "@lib/util/store-locale"

const CheckoutSummary = ({
  cart,
  countryCode,
}: {
  cart: HttpTypes.StoreCart
  countryCode: string
}) => {
  return (
    <aside className="sticky top-6 flex flex-col gap-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex w-full flex-col">
        <Heading
          level="h2"
          className="flex flex-row items-baseline text-xl font-semibold text-slate-900"
        >
          {translate(countryCode, "inYourCart")}
        </Heading>
        <Divider className="my-5" />
        <CartTotals totals={cart} />
        <ItemsPreviewTemplate cart={cart} />
        <div className="mt-6">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </aside>
  )
}

export default CheckoutSummary
