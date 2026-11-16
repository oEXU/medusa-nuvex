"use client"

import { HttpTypes } from "@medusajs/types"
import React, { useState } from "react"
import { useParams } from "next/navigation"
import { translate } from "@lib/util/store-locale"
import CountrySelect from "../country-select"
import CheckoutField from "../form-field"

const BillingAddress = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  const { countryCode } = useParams<{ countryCode: string }>()
  const [formData, setFormData] = useState<Record<string, string>>({
    "billing_address.first_name": cart?.billing_address?.first_name || "",
    "billing_address.last_name": cart?.billing_address?.last_name || "",
    "billing_address.address_1": cart?.billing_address?.address_1 || "",
    "billing_address.address_2": cart?.billing_address?.address_2 || "",
    "billing_address.postal_code": cart?.billing_address?.postal_code || "",
    "billing_address.city": cart?.billing_address?.city || "",
    "billing_address.country_code":
      cart?.billing_address?.country_code || countryCode || "",
    "billing_address.province": cart?.billing_address?.province || "",
    "billing_address.phone": cart?.billing_address?.phone || "",
  })

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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-sm text-slate-500">
          {isEnglish
            ? "Enter the billing address for your payment."
            : "Informe o endereço usado para cobrança."}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
        <CheckoutField
          label={translate(countryCode, "firstName")}
          name="billing_address.first_name"
          autoComplete="given-name"
          value={formData["billing_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="billing-first-name-input"
        />
        <CheckoutField
          label={translate(countryCode, "lastName")}
          name="billing_address.last_name"
          autoComplete="family-name"
          value={formData["billing_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="billing-last-name-input"
        />
        <CheckoutField
          label={translate(countryCode, "address")}
          name="billing_address.address_1"
          autoComplete="address-line1"
          value={formData["billing_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="billing-address-input"
        />
        <CheckoutField
          label={isEnglish ? "Apartment or suite" : "Número e complemento"}
          name="billing_address.address_2"
          autoComplete="address-line2"
          value={formData["billing_address.address_2"]}
          onChange={handleChange}
          required={countryCode === "br"}
          data-testid="billing-address-line2-input"
        />
        <CheckoutField
          label={translate(countryCode, "postalCode")}
          name="billing_address.postal_code"
          autoComplete="postal-code"
          value={formData["billing_address.postal_code"]}
          onChange={handleChange}
          required
          data-testid="billing-postal-input"
        />
        <CheckoutField
          label={translate(countryCode, "city")}
          name="billing_address.city"
          autoComplete="address-level2"
          value={formData["billing_address.city"]}
          onChange={handleChange}
          required
        />
        <label htmlFor="billing_address.country_code" className="block min-w-0">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            {translate(countryCode, "country")}
            <span className="ml-1 text-rose-600">*</span>
          </span>
          <CountrySelect
            id="billing_address.country_code"
            name="billing_address.country_code"
            autoComplete="country"
            region={cart?.region}
            value={formData["billing_address.country_code"]}
            onChange={handleChange}
            required
            aria-label={translate(countryCode, "country")}
            className="h-12 rounded-xl border-slate-300 bg-white focus-within:border-fuchsia-600 focus-within:ring-4 focus-within:ring-fuchsia-600/10"
            data-testid="billing-country-select"
          />
        </label>
        <CheckoutField
          label={isEnglish ? "State" : "Estado / Província"}
          name="billing_address.province"
          autoComplete="address-level1"
          value={formData["billing_address.province"]}
          onChange={handleChange}
          data-testid="billing-province-input"
        />
        <CheckoutField
          label={translate(countryCode, "phone")}
          name="billing_address.phone"
          type="tel"
          autoComplete="tel"
          value={formData["billing_address.phone"]}
          onChange={handleChange}
          data-testid="billing-phone-input"
        />
      </div>
    </div>
  )
}

export default BillingAddress
