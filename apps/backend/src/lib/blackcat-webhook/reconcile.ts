import type { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import {
  processPaymentWorkflow,
} from "@medusajs/medusa/core-flows"
import { updateBlackcatPaymentSessionWorkflow } from "../../workflows/blackcat-webhook/update-payment-session"
import {
  getBlackcatExternalReference,
  isBlackcatChargebackRefund,
  type BlackcatPayload,
} from "../../api/webhooks/blackcat/helpers"

export type BlackcatReconciliationResult = {
  status: "processed" | "ignored"
  outcome: string
}

type PaymentLike = {
  id: string
  amount: number
  currency_code: string
  captured_at?: string | Date | null
  refunded_amount?: number | null
}

type PaymentSessionLike = {
  id: string
  amount: number
  currency_code: string
  provider_id: string
  status: string
  data?: unknown
}

export async function reconcileBlackcatEvent(
  container: MedusaContainer,
  event: string,
  data: BlackcatPayload,
  idempotencyKey: string
): Promise<BlackcatReconciliationResult> {
  if (event === "transaction.created") {
    return { status: "processed", outcome: "transaction_created" }
  }

  if (isBlackcatChargebackRefund(event, data)) {
    return { status: "processed", outcome: "chargeback_recorded" }
  }

  if (
    event.startsWith("withdrawal.") ||
    event.startsWith("subscription.") ||
    event.startsWith("chargeback.") ||
    event.startsWith("med.")
  ) {
    return { status: "processed", outcome: "recorded_without_payment_mutation" }
  }

  if (event === "transaction.pending" || event === "transaction.scheduled") {
    return { status: "processed", outcome: "recorded_no_payment_change" }
  }

  const gatewayAmount = toAmount(data.amount)
  if (gatewayAmount === undefined) {
    return { status: "ignored", outcome: "retryable_missing_transaction_amount" }
  }

  if (typeof data.externalReference !== "string" || !data.externalReference) {
    return { status: "ignored", outcome: "retryable_missing_external_reference" }
  }

  const session = await findPaymentSession(container, data.externalReference)
  if (!session) {
    return { status: "ignored", outcome: "retryable_medusa_payment_session_not_found" }
  }

  if (session.provider_id !== "pp_blackcat_blackcat") {
    return { status: "ignored", outcome: "retryable_payment_provider_mismatch" }
  }

  if (session.currency_code.toLowerCase() !== "brl") {
    return { status: "ignored", outcome: "retryable_payment_currency_mismatch" }
  }

  const sessionAmount = Number(session.amount)
  if (Math.abs(gatewayAmount - sessionAmount) > 0.01) {
    return { status: "ignored", outcome: "retryable_payment_amount_mismatch" }
  }

  const transactionId = readString(data.transactionId)
  if (!transactionId) {
    return { status: "ignored", outcome: "retryable_missing_transaction_id" }
  }
  const sessionData = toRecord((session as PaymentSessionLike).data)
  const sessionTransactionId =
    readString(sessionData.transactionId) ?? readString(sessionData.id)
  if (sessionTransactionId !== transactionId) {
    return { status: "ignored", outcome: "retryable_transaction_session_mismatch" }
  }

  const verifiedStatus = await getVerifiedBlackcatStatus(transactionId)
  if (event === "transaction.refunded" && verifiedStatus !== "REFUNDED") {
    return { status: "ignored", outcome: "retryable_blackcat_status_not_refunded" }
  }

  if (verifiedStatus === "PAID" && event.startsWith("transaction.")) {
    const payments = await container.resolve(Modules.PAYMENT).listPayments({
      payment_session_id: session.id,
    })
    if (payments.some((payment) => payment.captured_at)) {
      return { status: "processed", outcome: "payment_already_captured" }
    }

    await processPaymentWorkflow(container).run({
      input: {
        action: "captured",
        data: { session_id: session.id, amount: sessionAmount },
      },
    })
    return { status: "processed", outcome: "payment_captured" }
  }

  if (event === "transaction.paid" && verifiedStatus !== "PAID") {
    return { status: "ignored", outcome: "retryable_blackcat_status_not_paid" }
  }

  if (event === "transaction.refunded") {
    return { status: "processed", outcome: "refund_requires_manual_review" }
  }

  if (
    (event === "transaction.failed" || event === "transaction.cancelled" || event === "transaction.refused") &&
    verifiedStatus === "CANCELLED"
  ) {
    const payments = await container.resolve(Modules.PAYMENT).listPayments({
      payment_session_id: session.id,
    })
    if (payments.some((payment) => payment.captured_at)) {
      return { status: "ignored", outcome: "captured_payment_not_cancelled" }
    }
    if (session.status === "canceled" || session.status === "error") {
      return { status: "processed", outcome: "payment_already_cancelled" }
    }

    await updateBlackcatPaymentSessionWorkflow(container).run({
      input: {
        id: session.id,
        data: sessionData,
        currency_code: session.currency_code,
        amount: Number(session.amount),
      },
    })
    return { status: "processed", outcome: "payment_cancelled" }
  }

  return { status: "processed", outcome: "recorded_no_payment_change" }
}

async function getVerifiedBlackcatStatus(transactionId: string) {
  const apiKey = process.env.BLACKCAT_API_KEY
  if (!apiKey) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "BLACKCAT_API_KEY is not configured"
    )
  }

  const response = await fetch(
    `https://api.blackcatoficial.com/api/sales/${encodeURIComponent(transactionId)}/status`,
    { headers: { "X-API-Key": apiKey } }
  )
  if (!response.ok) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `BlackCat status lookup failed with HTTP ${response.status}`
    )
  }

  const payload = await response.json() as Record<string, unknown>
  const result = toRecord(payload.data)
  if (payload.success !== true || result.transactionId !== transactionId) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "BlackCat status response did not match the transaction"
    )
  }
  return typeof result.status === "string" ? result.status.toUpperCase() : ""
}

async function findPaymentSession(container: MedusaContainer, sessionId: string) {
  const paymentModule = container.resolve(Modules.PAYMENT)
  try {
    return await paymentModule.retrievePaymentSession(
      getBlackcatExternalReference(sessionId)
    )
  } catch {
    return undefined
  }
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function toRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function toAmount(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return undefined
  }

  return Math.round(value) / 100
}
