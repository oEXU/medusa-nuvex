"use client"
import { setAddresses } from "@lib/data/cart"
import useToggleState from "@lib/hooks/use-toggle-state"
import compareAddresses from "@lib/util/compare-addresses"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import Divider from "@modules/common/components/divider"
import { Heading, Text } from "@modules/common/components/ui"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import { translate } from "@lib/util/store-locale"
import { useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { countryCode } = useParams<{ countryCode: string }>()

  const isOpen =
    searchParams.get("step") === "address" || !cart?.shipping_address

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-row items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-700">
            {countryCode === "us" ? "Checkout · step 1" : "Checkout · etapa 1"}
          </p>
          <Heading
            level="h2"
            className="flex flex-row items-center gap-x-2 text-2xl font-semibold tracking-tight text-slate-900"
          >
            {translate(countryCode, "shippingAddress")}
            {!isOpen && <CheckCircleSolid />}
          </Heading>
          {isOpen && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {countryCode === "us"
                ? "Add your contact and delivery details to continue."
                : "Preencha seus dados de contato e entrega para continuar."}
            </p>
          )}
        </div>
        {!isOpen && cart?.shipping_address && (
          <Text>
            <button
              onClick={handleEdit}
              className="rounded-lg px-3 py-2 text-sm font-medium text-fuchsia-700 transition hover:bg-fuchsia-50"
              data-testid="edit-address-button"
            >
              {translate(countryCode, "edit")}
            </button>
          </Text>
        )}
      </div>
      {isOpen ? (
        <form action={formAction} className="mt-7">
          <div>
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />

            {!sameAsBilling && (
              <section className="mt-8 border-t border-slate-200 pt-7">
                <Heading
                  level="h3"
                  className="mb-4 text-lg font-semibold text-slate-900"
                >
                  {translate(countryCode, "billingAddress")}
                </Heading>

                <BillingAddress cart={cart} />
              </section>
            )}
            <SubmitButton
              size="large"
              className="mt-7 w-full sm:w-auto sm:min-w-64"
              data-testid="submit-address-button"
            >
              {translate(countryCode, "continueDelivery")}
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && cart.shipping_address ? (
              <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
                <div
                  className="flex min-w-0 flex-col"
                  data-testid="shipping-address-summary"
                >
                  <Text className="txt-medium-plus text-ui-fg-base mb-1">
                    {translate(countryCode, "shippingAddress")}
                  </Text>
                  <Text className="txt-medium text-ui-fg-subtle">
                    {cart.shipping_address.first_name}{" "}
                    {cart.shipping_address.last_name}
                  </Text>
                  <Text className="txt-medium text-ui-fg-subtle">
                    {cart.shipping_address.address_1}{" "}
                    {cart.shipping_address.address_2}
                  </Text>
                  <Text className="txt-medium text-ui-fg-subtle">
                    {cart.shipping_address.postal_code},{" "}
                    {cart.shipping_address.city}
                  </Text>
                  <Text className="txt-medium text-ui-fg-subtle">
                    {cart.shipping_address.country_code?.toUpperCase()}
                  </Text>
                </div>

                <div
                  className="flex min-w-0 flex-col"
                  data-testid="shipping-contact-summary"
                >
                  <Text className="txt-medium-plus text-ui-fg-base mb-1">
                    {translate(countryCode, "contactLabel")}
                  </Text>
                  <Text className="txt-medium text-ui-fg-subtle">
                    {cart.shipping_address.phone}
                  </Text>
                  <Text className="txt-medium text-ui-fg-subtle">
                    {cart.email}
                  </Text>
                </div>

                <div
                  className="flex min-w-0 flex-col"
                  data-testid="billing-address-summary"
                >
                  <Text className="txt-medium-plus text-ui-fg-base mb-1">
                    {translate(countryCode, "billingAddress")}
                  </Text>

                  {sameAsBilling ? (
                    <Text className="txt-medium text-ui-fg-subtle">
                      {translate(countryCode, "sameBillingAddress")}
                    </Text>
                  ) : (
                    <>
                      <Text className="txt-medium text-ui-fg-subtle">
                        {cart.billing_address?.first_name}{" "}
                        {cart.billing_address?.last_name}
                      </Text>
                      <Text className="txt-medium text-ui-fg-subtle">
                        {cart.billing_address?.address_1}{" "}
                        {cart.billing_address?.address_2}
                      </Text>
                      <Text className="txt-medium text-ui-fg-subtle">
                        {cart.billing_address?.postal_code},{" "}
                        {cart.billing_address?.city}
                      </Text>
                      <Text className="txt-medium text-ui-fg-subtle">
                        {cart.billing_address?.country_code?.toUpperCase()}
                      </Text>
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </section>
  )
}

export default Addresses
