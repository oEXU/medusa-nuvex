import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

type PaymentSession = {
  id: string
  provider_id: string
  status: string
  amount: number
  data?: Record<string, unknown>
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const session = await req.scope
      .resolve(Modules.PAYMENT)
      .retrievePaymentSession(req.params.id) as PaymentSession

    if (session.provider_id !== "pp_blackcat_blackcat") {
      return res.status(404).json({ error: "payment_not_found" })
    }

    const data = session.data ?? {}
    res.setHeader("Cache-Control", "no-store")
    return res.json({
      payment: {
        sessionId: session.id,
        transactionId: data.transactionId,
        status: session.status,
        amountInCents: Math.round(Number(session.amount) * 100),
        checkoutUrl: data.invoiceUrl,
      },
    })
  } catch {
    return res.status(404).json({ error: "payment_not_found" })
  }
}
