"use client"

import { Badge, Heading, Input, Label, Text } from "@modules/common/components/ui"
import React from "react"

import { applyPromotions } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import Trash from "@modules/common/icons/trash"
import ErrorMessage from "../error-message"
import { SubmitButton } from "../submit-button"

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart
}

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  const { promotions = [] } = cart
  const removePromotionCode = async (code: string) => {
    const validPromotions = promotions.filter(
      (promotion) => promotion.code !== code
    )

    await applyPromotions(
      validPromotions.filter((p) => p.code !== undefined).map((p) => p.code!)
    )
  }

  const addPromotionCode = async (formData: FormData) => {
    setErrorMessage("")

    const code = formData.get("code")
    if (!code) {
      return
    }
    const input = document.getElementById("promotion-input") as HTMLInputElement
    const codes = promotions
      .filter((p) => p.code !== undefined)
      .map((p) => p.code!)
    codes.push(code.toString())

    try {
      await applyPromotions(codes)
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e))
    }

    if (input) {
      input.value = ""
    }
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
      <form action={(a) => addPromotionCode(a)} className="w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="flex w-full items-center justify-between gap-3 rounded-xl px-1 py-1 text-left transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600"
          data-testid="add-discount-button"
          aria-expanded={isOpen}
        >
          <span className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fuchsia-100 text-fuchsia-700">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v2.1a2 2 0 0 0 0 3.8v3.1a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-3.1a2 2 0 0 0 0-3.8V7.5Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 5.5v13"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeDasharray="2.5 2.5"
                />
              </svg>
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-900">
                Adicionar cupom de desconto
              </span>
              <span className="block text-xs text-slate-500">
                Tem um código promocional?
              </span>
            </span>
          </span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            className={`shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <path
              d="m5 7.5 5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2">
            <div className="flex w-full items-stretch gap-2">
              <Label htmlFor="promotion-input" className="sr-only">
                Código promocional
              </Label>
              <Input
                className="h-11 min-w-0 flex-1 border-slate-300 bg-white uppercase placeholder:normal-case"
                id="promotion-input"
                name="code"
                type="text"
                placeholder="Digite o código"
                autoComplete="off"
                data-testid="discount-input"
              />
              <SubmitButton
                variant="primary"
                className="h-11 shrink-0 px-4"
                data-testid="discount-apply-button"
              >
                Aplicar
              </SubmitButton>
            </div>

            <ErrorMessage
              error={errorMessage}
              data-testid="discount-error-message"
            />
          </div>
        )}
      </form>

      {promotions.length > 0 && (
        <div className="mt-3 border-t border-slate-200 pt-3">
          <Heading level="h3" className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Cupons aplicados
          </Heading>

          <div className="flex flex-col gap-2">
            {promotions.map((promotion) => {
              return (
                <div
                  key={promotion.id}
                  className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2"
                  data-testid="discount-row"
                >
                  <Text className="min-w-0 flex-1 text-sm text-slate-700">
                    <span className="flex min-w-0 items-center gap-2" data-testid="discount-code">
                      <Badge
                        color={promotion.is_automatic ? "green" : "grey"}
                        className="max-w-full truncate"
                      >
                        {promotion.code}
                      </Badge>
                      <span className="shrink-0 font-semibold text-emerald-700">
                        {promotion.application_method?.value !== undefined &&
                          promotion.application_method.currency_code !==
                            undefined && (
                            <>
                              {promotion.application_method.type ===
                              "percentage"
                                ? `${promotion.application_method.value}%`
                                : convertToLocale({
                                    amount: +promotion.application_method.value,
                                    currency_code:
                                      promotion.application_method
                                        .currency_code,
                                  })}
                            </>
                          )}
                      </span>
                    </span>
                  </Text>
                  {!promotion.is_automatic && (
                    <button
                      type="button"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600"
                      onClick={() => {
                        if (!promotion.code) {
                          return
                        }

                        removePromotionCode(promotion.code)
                      }}
                      data-testid="remove-discount-button"
                      aria-label="Remover cupom"
                    >
                      <Trash size={15} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default DiscountCode
