import { forwardRef, useImperativeHandle, useMemo, useRef } from "react"

import NativeSelect, {
  NativeSelectProps,
} from "@modules/common/components/native-select"
import { HttpTypes } from "@medusajs/types"
import { useParams } from "next/navigation"
import { translate } from "@lib/util/store-locale"

const CountrySelect = forwardRef<
  HTMLSelectElement,
  NativeSelectProps & {
    region?: HttpTypes.StoreRegion
  }
>(({ placeholder, region, defaultValue, ...props }, ref) => {
  const { countryCode } = useParams<{ countryCode: string }>()
  const innerRef = useRef<HTMLSelectElement>(null)

  useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
    ref,
    () => innerRef.current
  )

  const countryOptions = useMemo(() => {
    const countries = region?.countries ?? []

    if (countries?.length) {
      return countries
        .flatMap((country) =>
          country.iso_2
            ? [
                {
                  value: country.iso_2,
                  label:
                    country.display_name || country.iso_2.toUpperCase(),
                },
              ]
            : []
        )
        .sort((a, b) => a.label.localeCompare(b.label))
    }

    const fallbackCode = countryCode?.toLowerCase()

    if (!fallbackCode) {
      return []
    }

    const locale = countryCode === "us" ? "en-US" : "pt-BR"
    const fallbackLabel =
      new Intl.DisplayNames([locale], { type: "region" }).of(
        fallbackCode.toUpperCase()
      ) ?? fallbackCode.toUpperCase()

    return [{ value: fallbackCode, label: fallbackLabel }]
  }, [countryCode, region])

  return (
    <NativeSelect
      ref={innerRef}
      placeholder={placeholder ?? translate(countryCode, "country")}
      defaultValue={defaultValue}
      {...props}
    >
      {countryOptions?.map(({ value, label }, index) => (
        <option key={index} value={value}>
          {label}
        </option>
      ))}
    </NativeSelect>
  )
})

CountrySelect.displayName = "CountrySelect"

export default CountrySelect
