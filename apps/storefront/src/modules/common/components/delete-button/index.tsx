import { deleteLineItem } from "@lib/data/cart"
import { notifyCartUpdated } from "@lib/util/cart-events"
import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useRouter } from "next/navigation"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
  "data-testid": dataTestid,
}: {
  id: string
  children?: React.ReactNode
  className?: string
  "data-testid"?: string
}) => {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (isDeleting) {
      return
    }

    setError(null)
    setIsDeleting(true)

    try {
      await deleteLineItem(id)
      notifyCartUpdated()
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not remove this item."
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className={clx(
        "flex items-center justify-between text-small-regular",
        className
      )}
    >
      <button
        type="button"
        className="flex gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base cursor-pointer"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-busy={isDeleting}
        data-testid={dataTestid}
      >
        {isDeleting ? <Spinner className="animate-spin" /> : <Trash />}
        <span>{children}</span>
      </button>
      {error && (
        <p className="mt-1 text-small-regular text-rose-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default DeleteButton
