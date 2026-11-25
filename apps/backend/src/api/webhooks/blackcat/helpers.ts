import { createHash } from "node:crypto"

export const BLACKCAT_EVENTS = new Set([
  "transaction.created",
  "transaction.paid",
  "transaction.failed",
  "transaction.refunded",
  "transaction.pending",
  "transaction.scheduled",
  "transaction.cancelled",
  "transaction.refused",
  "withdrawal.created",
  "withdrawal.completed",
  "withdrawal.failed",
  "withdrawal.cancelled",
  "subscription.created",
  "subscription.renewed",
  "subscription.past_due",
  "subscription.canceled",
  "chargeback.opened",
  "chargeback.updated",
  "chargeback.closed",
  "med.opened",
  "med.updated",
  "med.closed",
])

export type BlackcatPayload = Record<string, unknown>

export function isBlackcatTestEvent(data: BlackcatPayload) {
  return data.test === true
}

export function getBlackcatExternalReference(medusaPaymentSessionId: string) {
  return medusaPaymentSessionId
}

export function getValidatedBlackcatEvent(
  headerEvent: unknown,
  payload: BlackcatPayload
) {
  if (
    typeof headerEvent !== "string" ||
    typeof payload.event !== "string" ||
    payload.event !== headerEvent
  ) {
    return undefined
  }

  return headerEvent
}

export function isBlackcatChargebackRefund(
  event: string,
  data: BlackcatPayload
) {
  return event === "transaction.refunded" && data.chargeback === true
}

export function isRetryableBlackcatOutcome(outcome?: string | null) {
  return outcome?.startsWith("retryable_") ?? false
}

export function getBlackcatRetryPayload(data: BlackcatPayload) {
  const fields = [
    "transactionId",
    "externalReference",
    "status",
    "amount",
    "refundedAmount",
    "chargeback",
  ] as const

  return Object.fromEntries(
    fields.flatMap((field) =>
      data[field] === undefined ? [] : [[field, data[field]]]
    )
  ) as BlackcatPayload
}

export function getBlackcatEntityId(
  event: string,
  data: BlackcatPayload,
  payload: BlackcatPayload
) {
  if (event.startsWith("withdrawal.")) {
    return readString(data.withdrawalId)
  }

  if (event.startsWith("subscription.")) {
    const subscription = asRecord(data.subscription)
    return readString(subscription?.id)
  }

  if (event.startsWith("chargeback.") || event.startsWith("med.")) {
    const dispute = asRecord(data.dispute)
    return readString(dispute?.id) ?? readString(data.transactionId)
  }

  return readString(data.transactionId) ?? readString(payload.transactionId)
}

export function getBlackcatIdempotencyKey(
  event: string,
  data: BlackcatPayload,
  entityId: string | undefined,
  rawBody: Buffer
) {
  const subscription = asRecord(data.subscription)
  const cycle = readScalar(data.cycle) ?? readScalar(subscription?.cycle)
  const bodyHash = createHash("sha256").update(rawBody).digest("hex")
  let identity = bodyHash

  if (entityId) {
    identity = entityId
    if (event.startsWith("subscription.")) {
      identity += cycle ? `:${cycle}` : `:${bodyHash}`
    } else if (event.startsWith("chargeback.") || event.startsWith("med.")) {
      identity += `:${bodyHash}`
    } else if (event === "transaction.refunded") {
      identity += `:${bodyHash}`
    }
  }

  return `${event}:${identity}`
}

export function getBlackcatPayloadData(payload: BlackcatPayload) {
  return asRecord(payload.data) ?? payload
}

function asRecord(value: unknown): BlackcatPayload | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as BlackcatPayload)
    : undefined
}

function readString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

function readScalar(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : undefined
}
