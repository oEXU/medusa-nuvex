"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@modules/common/components/ui"
import Checkbox from "@modules/common/components/checkbox"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { translate } from "@lib/util/store-locale"
import AddressSelect from "../address-select"
import CountrySelect from "../country-select"
import CheckoutField from "../form-field"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const { countryCode } = useParams<{ countryCode: string }>()
  const [formData, setFormData] = useState<Record<string, string>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.address_2": cart?.shipping_address?.address_2 || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code":
      cart?.shipping_address?.country_code || countryCode || "",
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    cpf: typeof cart?.metadata?.cpf === "string" ? cart.metadata.cpf : "",
    email: cart?.email || "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((country) => country.iso_2),
    [cart?.region]
  )

  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (address) =>
          address.country_code &&
          countriesInRegion?.includes(address.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    if (address) {
      setFormData((previous) => ({
        ...previous,
        "shipping_address.first_name": address.first_name || "",
        "shipping_address.last_name": address.last_name || "",
        "shipping_address.address_1": address.address_1 || "",
        "shipping_address.address_2": address.address_2 || "",
        "shipping_address.postal_code": address.postal_code || "",
        "shipping_address.city": address.city || "",
        "shipping_address.country_code": address.country_code || "",
        "shipping_address.province": address.province || "",
        "shipping_address.phone": address.phone || "",
      }))
    }

    if (email) {
      setFormData((previous) => ({ ...previous, email }))
    }
  }

  useEffect(() => {
    if (cart?.shipping_address) {
      setFormAddress(cart.shipping_address, cart.email)
    } else if (customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart, customer?.email])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }))
  }

  const isEnglish = countryCode === "us"

  return (
    <div className="space-y-8">
      {customer && (addressesInRegion?.length ?? 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-700">
            {isEnglish
              ? `Hi ${customer.first_name}, use a saved address?`
              : `Olá ${customer.first_name}, deseja usar um endereço salvo?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as unknown as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}

      <section>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-700">
            {isEnglish ? "Your details" : "Seus dados"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {isEnglish
              ? "We’ll use these details to contact you about your order."
              : "Usaremos estes dados para falar com você sobre o pedido."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
          <CheckoutField
            label={translate(countryCode, "firstName")}
            name="shipping_address.first_name"
            autoComplete="given-name"
            placeholder={isEnglish ? "First name" : "Seu nome"}
            value={formData["shipping_address.first_name"]}
            onChange={handleChange}
            required
            data-testid="shipping-first-name-input"
          />
          <CheckoutField
            label={translate(countryCode, "lastName")}
            name="shipping_address.last_name"
            autoComplete="family-name"
            placeholder={isEnglish ? "Last name" : "Seu sobrenome"}
            value={formData["shipping_address.last_name"]}
            onChange={handleChange}
            required
            data-testid="shipping-last-name-input"
          />
          <CheckoutField
            label={translate(countryCode, "email")}
            name="email"
            type="email"
            autoComplete="email"
            placeholder={isEnglish ? "you@example.com" : "voce@exemplo.com"}
            value={formData.email}
            onChange={handleChange}
            required
            data-testid="shipping-email-input"
          />
          <CheckoutField
            label={translate(countryCode, "phone")}
            name="shipping_address.phone"
            type="tel"
            autoComplete="tel"
            placeholder={isEnglish ? "Phone number" : "(00) 00000-0000"}
            value={formData["shipping_address.phone"]}
            onChange={handleChange}
            required
            data-testid="shipping-phone-input"
          />
          <CheckoutField
            label="CPF"
            name="cpf"
            autoComplete="off"
            inputMode="numeric"
            maxLength={14}
            pattern="\d{3}\.?\d{3}\.?\d{3}-?\d{2}"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={handleChange}
            required={countryCode === "br"}
            data-testid="shipping-cpf-input"
          />
        </div>
      </section>

      <div className="border-t border-slate-200" />

      <section>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-700">
            {isEnglish ? "Delivery address" : "Endereço de entrega"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {isEnglish
              ? "Enter the address where your order should be delivered."
              : "Informe onde você deseja receber o pedido."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
          <CheckoutField
            label={translate(countryCode, "postalCode")}
            name="shipping_address.postal_code"
            autoComplete="postal-code"
            placeholder={isEnglish ? "ZIP code" : "00000-000"}
            value={formData["shipping_address.postal_code"]}
            onChange={handleChange}
            required
            data-testid="shipping-postal-code-input"
          />
          <label
            htmlFor="shipping_address.country_code"
            className="block min-w-0"
          >
            <span className="mb-2 block text-sm font-medium text-slate-700">
              {translate(countryCode, "country")}
              <span className="ml-1 text-rose-600">*</span>
            </span>
            <CountrySelect
              id="shipping_address.country_code"
              name="shipping_address.country_code"
              autoComplete="country"
              region={cart?.region}
              value={formData["shipping_address.country_code"]}
              onChange={handleChange}
              required
              aria-label={translate(countryCode, "country")}
              className="h-12 rounded-xl border-slate-300 bg-white focus-within:border-fuchsia-600 focus-within:ring-4 focus-within:ring-fuchsia-600/10"
              data-testid="shipping-country-select"
            />
          </label>
          <CheckoutField
            label={isEnglish ? "Street address" : "Rua e avenida"}
            name="shipping_address.address_1"
            autoComplete="address-line1"
            placeholder={isEnglish ? "Street and number" : "Rua, avenida"}
            value={formData["shipping_address.address_1"]}
            onChange={handleChange}
            required
            data-testid="shipping-address-input"
          />
          <CheckoutField
            label={isEnglish ? "Apartment or suite" : "Número e complemento"}
            name="shipping_address.address_2"
            autoComplete="address-line2"
            placeholder={
              isEnglish ? "Apartment, suite, etc." : "Número, apto..."
            }
            value={formData["shipping_address.address_2"]}
            onChange={handleChange}
            required={countryCode === "br"}
            data-testid="shipping-address-line2-input"
          />
          <CheckoutField
            label={translate(countryCode, "city")}
            name="shipping_address.city"
            autoComplete="address-level2"
            placeholder={isEnglish ? "City" : "Sua cidade"}
            value={formData["shipping_address.city"]}
            onChange={handleChange}
            required
            data-testid="shipping-city-input"
          />
          <CheckoutField
            label={isEnglish ? "State" : "Estado / Província"}
            name="shipping_address.province"
            autoComplete="address-level1"
            placeholder={isEnglish ? "State" : "Seu estado"}
            value={formData["shipping_address.province"]}
            onChange={handleChange}
            data-testid="shipping-province-input"
          />
        </div>
      </section>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
        <Checkbox
          label={translate(countryCode, "sameBillingAddress")}
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
          data-testid="billing-address-checkbox"
        />
      </div>
    </div>
  )
}

export default ShippingAddress
