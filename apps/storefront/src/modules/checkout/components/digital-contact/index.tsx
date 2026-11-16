"use client"

import { setDigitalCartEmail } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import CheckoutField from "@modules/checkout/components/form-field"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { useActionState } from "react"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import { useState } from "react"

const DigitalContact = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const [message, formAction] = useActionState(setDigitalCartEmail, null)
  const [email, setEmail] = useState(cart.email || "")
  const { countryCode } = useParams<{ countryCode: string }>()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEnglish = countryCode === "us"
  const isEditing = searchParams.get("step") === "contact"
  const isOpen = !cart.email || isEditing

  const handleEdit = () => {
    router.push(pathname + "?step=contact", { scroll: false })
  }

  return (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <p className="text-sm font-semibold text-slate-800">
        {isEnglish ? "Digital media" : "Mídia digital"}
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        {isEnglish
          ? "Enter the email address associated with this digital order."
          : "Informe o e-mail que ficará associado ao pedido digital."}
      </p>

      {isOpen ? (
        <form action={formAction} className="mt-4 max-w-xl">
          <input type="hidden" name="country_code" value={countryCode} />
          <CheckoutField
            label={isEnglish ? "Email" : "E-mail"}
            name="email"
            type="email"
            autoComplete="email"
            placeholder={isEnglish ? "you@example.com" : "voce@exemplo.com"}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            data-testid="digital-delivery-email-input"
          />
          <ErrorMessage error={message} data-testid="digital-email-error" />
          <SubmitButton
            size="large"
            className="mt-6 w-full sm:w-auto sm:min-w-64"
            data-testid="submit-digital-email-button"
          >
            {isEnglish ? "Continue to payment" : "Continuar para pagamento"}
          </SubmitButton>
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-800">
              {isEnglish ? "Delivery email" : "E-mail de entrega"}
            </p>
            <p className="mt-1 text-sm text-slate-500">{cart.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="rounded-lg px-3 py-2 text-sm font-medium text-fuchsia-700 transition hover:bg-fuchsia-50"
              data-testid="edit-digital-email-button"
            >
              {isEnglish ? "Edit" : "Editar"}
            </button>
            <button
              onClick={() =>
                router.push(pathname + "?step=payment", { scroll: false })
              }
              className="rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-700"
              data-testid="continue-digital-delivery-button"
            >
              {isEnglish ? "Continue to payment" : "Continuar para pagamento"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DigitalContact
