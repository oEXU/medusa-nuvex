import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading } from "@medusajs/ui"
import Medusa from "@medusajs/js-sdk"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { convertBrlToUsd } from "../../lib/currency-pricing"

const sdk = new Medusa({
  baseUrl: "/",
  auth: { type: "session" },
})

type VariantPrice = {
  id?: string
  currency_code: string
  amount: number
  min_quantity?: number | null
  max_quantity?: number | null
  rules?: Record<string, string>
}

type ProductVariant = {
  id: string
  title: string
  prices: VariantPrice[]
}

type Product = {
  id: string
  variants: ProductVariant[]
}

type WidgetProps = {
  data: {
    id: string
  }
}

const CurrencyPricesWidget = ({ data: product }: WidgetProps) => {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<Record<string, { brl: string; usd: string }>>({})
  const productQuery = useQuery({
    queryKey: ["product-currency-prices", product.id],
    queryFn: () =>
      sdk.client.fetch<{ product: Product }>(`/admin/products/${product.id}`, {
        query: { fields: "*variants.prices" },
      }),
  })

  const savePrices = useMutation({
    mutationFn: async (variant: ProductVariant) => {
      const current = values[variant.id] ?? getCurrentValues(variant)

      const brlAmount = Number(current.brl)
      const usdAmount = Number(current.usd)

      if (
        !Number.isFinite(brlAmount) ||
        brlAmount <= 0 ||
        !Number.isFinite(usdAmount) ||
        usdAmount <= 0
      ) {
        throw new Error("Informe valores positivos para BRL e USD.")
      }

      const otherPrices = variant.prices.filter(
        (price) => !["brl", "usd"].includes(price.currency_code.toLowerCase()),
      )
      const prices: VariantPrice[] = [
        ...otherPrices,
        buildPrice(variant, "brl", brlAmount),
        buildPrice(variant, "usd", usdAmount),
      ]

      await sdk.client.fetch(
        `/admin/products/${product.id}/variants/${variant.id}`,
        {
          method: "POST",
          body: { prices },
        },
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["product-currency-prices", product.id],
      })
    },
  })

  const variants = productQuery.data?.product.variants ?? []

  return (
    <Container className="flex flex-col gap-5 py-6">
      <div>
        <Heading level="h2">Preços por moeda</Heading>
        <p className="mt-1 text-sm text-ui-fg-subtle">
          Defina os preços de cada variante para as lojas do Brasil e dos
          Estados Unidos. O USD é calculado a partir do BRL quando ainda não
          existe um preço definido, usando R$ 5,20 por US$ 1.
        </p>
      </div>

      {productQuery.isLoading ? (
        <p className="text-sm text-ui-fg-subtle">Carregando variantes...</p>
      ) : productQuery.error ? (
        <p role="alert" className="text-sm text-ui-fg-error">
          Não foi possível carregar as variantes: {productQuery.error.message}
        </p>
      ) : variants.length ? (
        <div className="flex flex-col gap-4">
          {variants.map((variant) => {
            const current = values[variant.id] ?? getCurrentValues(variant)

            return (
              <div
                key={variant.id}
                className="grid gap-4 rounded-lg border border-ui-border-base p-4 small:grid-cols-[1fr_180px_180px_auto] small:items-end"
              >
                <div>
                  <p className="text-sm font-medium text-ui-fg-base">
                    {variant.title}
                  </p>
                  <p className="mt-1 text-xs text-ui-fg-subtle">
                    {variant.id}
                  </p>
                </div>
                <PriceInput
                  label="Preço em reais (BRL)"
                  value={current.brl}
                  onChange={(brl) => {
                    const usd = getAmount(variant, "usd")
                    setValues((previous) => ({
                      ...previous,
                      [variant.id]: {
                        ...current,
                        brl,
                        usd: usd ? current.usd : getConvertedUsd(brl),
                      },
                    }))
                  }}
                />
                <PriceInput
                  label="Price in US dollars (USD)"
                  value={current.usd}
                  onChange={(usd) =>
                    setValues((previous) => ({
                      ...previous,
                      [variant.id]: { ...current, usd },
                    }))
                  }
                />
                <Button
                  size="small"
                  isLoading={savePrices.isPending}
                  onClick={() => savePrices.mutate(variant)}
                >
                  Salvar preços
                </Button>
              </div>
            )
          })}
          {savePrices.error && (
            <p role="alert" className="text-sm text-ui-fg-error">
              Não foi possível salvar os preços: {savePrices.error.message}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-ui-fg-subtle">
          Este produto ainda não possui variantes para precificar.
        </p>
      )}
    </Container>
  )
}

const getAmount = (variant: ProductVariant, currencyCode: string) => {
  const price = variant.prices.find(
    (item) => item.currency_code.toLowerCase() === currencyCode,
  )
  return price ? String(price.amount) : ""
}

const getCurrentValues = (variant: ProductVariant) => {
  const brl = getAmount(variant, "brl")
  const usd = getAmount(variant, "usd")

  return {
    brl,
    usd: usd || getConvertedUsd(brl),
  }
}

const getConvertedUsd = (brl: string) => {
  const amount = Number(brl)
  return Number.isFinite(amount) && amount > 0
    ? String(convertBrlToUsd(amount))
    : ""
}

const buildPrice = (
  variant: ProductVariant,
  currencyCode: string,
  amount: number,
): VariantPrice => {
  const existing = variant.prices.find(
    (price) => price.currency_code.toLowerCase() === currencyCode,
  )

  return {
    ...(existing?.id ? { id: existing.id } : {}),
    currency_code: currencyCode,
    amount,
  }
}

const PriceInput = ({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) => (
  <label className="flex flex-col gap-1 text-xs font-medium text-ui-fg-subtle">
    {label}
    <input
      type="number"
      min="0.01"
      step="0.01"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm text-ui-fg-base"
    />
  </label>
)

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default CurrencyPricesWidget
