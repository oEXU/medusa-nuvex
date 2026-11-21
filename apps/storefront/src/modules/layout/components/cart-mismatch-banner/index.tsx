"use client"

import { transferCart } from "@lib/data/customer"
import { ExclamationCircleSolid } from "@medusajs/icons"
import { StoreCart, StoreCustomer } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

function CartMismatchBanner(props: {
  customer: StoreCustomer
  cart: StoreCart
}) {
  const { customer, cart } = props
  const router = useRouter()
  const attemptedTransfer = useRef(false)
  const transferInProgress = useRef(false)
  const [isPending, setIsPending] = useState(false)
  const [actionText, setActionText] = useState("Run transfer again")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async () => {
    if (transferInProgress.current) {
      return
    }

    transferInProgress.current = true
    setError(null)
    try {
      setIsPending(true)
      setActionText("Transferring..")

      await transferCart()
      setActionText("Transfer complete")
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The cart could not be transferred. Try again."
      )
      setActionText("Run transfer again")
    } finally {
      transferInProgress.current = false
      setIsPending(false)
    }
  }, [router])

  useEffect(() => {
    if (!customer || cart.customer_id || attemptedTransfer.current) {
      return
    }

    attemptedTransfer.current = true
    void handleSubmit()
  }, [cart.customer_id, customer, handleSubmit])

  if (!customer || !!cart.customer_id) {
    return
  }

  return (
    <div className="flex items-center justify-center small:p-4 p-2 text-center bg-orange-300 small:gap-2 gap-1 text-sm mt-2 text-orange-800">
      <div className="flex flex-col small:flex-row small:gap-2 gap-1 items-center">
        <span className="flex items-center gap-1">
          <ExclamationCircleSolid className="inline" />
          {isPending
            ? "Transferring your cart..."
            : error
              ? "Something went wrong when we tried to transfer your cart"
              : "Your cart needs to be transferred"}
        </span>

        <span>·</span>

        <Button
          variant="transparent"
          className="hover:bg-transparent active:bg-transparent focus:bg-transparent disabled:text-orange-500 text-orange-950 p-0 bg-transparent"
          size="medium"
          disabled={isPending}
          onClick={handleSubmit}
        >
          {actionText}
        </Button>
        {error && (
          <span className="text-orange-950" role="alert">
            {error}
          </span>
        )}
      </div>
    </div>
  )
}

export default CartMismatchBanner
