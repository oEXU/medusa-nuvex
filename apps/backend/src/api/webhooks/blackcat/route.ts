import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { createHash } from "node:crypto"
import { reconcileBlackcatEvent } from "../../../lib/blackcat-webhook/reconcile"
import {
  BLACKCAT_EVENTS,
  getBlackcatEntityId,
  getBlackcatIdempotencyKey,
  getBlackcatPayloadData,
  getBlackcatRetryPayload,
  getValidatedBlackcatEvent,
  isBlackcatTestEvent,
  isRetryableBlackcatOutcome,
  type BlackcatPayload,
} from "./helpers"
import { recordBlackcatWebhookEventWorkflow } from "../../../workflows/blackcat-webhook/record-blackcat-webhook-event"

export const AUTHENTICATE = false

type WebhookRecord = {
  id: string
  idempotency_key: string
  event_type: string
  entity_id?: string | null
  status: string
  outcome?: string | null
  error?: string | null
  updated_at?: string | Date
}

type EventService = {
  listBlackcatWebhookEvents: (
    filter: { idempotency_key: string }
  ) => Promise<WebhookRecord[]>
}

type HandlerResult = {
  statusCode: number
  body: Record<string, unknown>
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const rawBody = req.rawBody as Buffer | undefined
  const source = req.headers["x-webhook-source"]
  const headerEvent = req.headers["x-webhook-event"]
  const payload = req.body as BlackcatPayload

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return res.status(400).json({ error: "invalid_payload" })
  }
  if (!rawBody) {
    return res.status(400).json({ error: "invalid_payload" })
  }

  if (source !== "blackcat-api") {
    return res.status(400).json({ error: "invalid_webhook_source" })
  }

  const event = getValidatedBlackcatEvent(headerEvent, payload)
  if (!event) {
    return res.status(400).json({ error: "event_header_payload_mismatch" })
  }

  const data = getBlackcatPayloadData(payload)
  if (!hasExpectedTransactionStatus(event, data)) {
    return res.status(400).json({ error: "event_status_mismatch" })
  }

  if (isBlackcatTestEvent(data)) {
    return res.status(200).json({
      received: true,
      event,
      test: true,
      result: "test_event_ignored",
    })
  }

  const entityId = getBlackcatEntityId(event, data, payload)
  const idempotencyKey = getBlackcatIdempotencyKey(
    event,
    data,
    entityId,
    rawBody
  )
  const bodyHash = createHash("sha256").update(rawBody).digest("hex")
  const retryPayload = event.startsWith("transaction.")
    ? getBlackcatRetryPayload(data)
    : null
  const locking = req.scope.resolve(Modules.LOCKING)

  try {
    const result = await locking.execute(
      `blackcat-webhook:${idempotencyKey}`,
      async () =>
        processDelivery(req, {
          event,
          data,
          entityId,
          idempotencyKey,
          bodyHash,
          retryPayload,
        }),
      { timeout: 1, expire: 30 }
    )

    return res.status(result.statusCode).json(result.body)
  } catch {
    return res.status(503).json({ error: "event_processing_busy" })
  }
}

type DeliveryInput = {
  event: string
  data: BlackcatPayload
  entityId?: string
  idempotencyKey: string
  bodyHash: string
  retryPayload: BlackcatPayload | null
}

async function processDelivery(
  req: MedusaRequest,
  input: DeliveryInput
): Promise<HandlerResult> {
  const eventService = req.scope.resolve<EventService>("blackcatWebhookEvent")
  let record = (await eventService.listBlackcatWebhookEvents({
    idempotency_key: input.idempotencyKey,
  }))[0]

  if (record && isTerminalRecord(record)) {
    return {
      statusCode: 200,
      body: { received: true, duplicate: true },
    }
  }

  if (record && record.status === "processing" && !isStale(record.updated_at)) {
    return {
      statusCode: 503,
      body: { error: "event_processing" },
    }
  }

  if (record) {
    await recordBlackcatWebhookEventWorkflow(req.scope).run({
      input: {
        operation: "update",
        id: record.id,
        status: "processing",
        error: null,
        body_hash: input.bodyHash,
        payload: input.retryPayload,
      },
    })
  } else {
    try {
      const { result } = await recordBlackcatWebhookEventWorkflow(req.scope).run({
        input: {
          operation: "create",
          idempotency_key: input.idempotencyKey,
          event_type: input.event,
          entity_id: input.entityId ?? null,
          body_hash: input.bodyHash,
          payload: input.retryPayload,
          status: "processing",
        },
      })
      record = result as WebhookRecord
    } catch {
      return {
        statusCode: 503,
        body: { error: "event_claim_failed" },
      }
    }
  }

  try {
    const result = BLACKCAT_EVENTS.has(input.event)
      ? await reconcileBlackcatEvent(
          req.scope,
          input.event,
          input.data,
          input.idempotencyKey
        )
      : { status: "ignored" as const, outcome: "unknown_event" }

    await recordBlackcatWebhookEventWorkflow(req.scope).run({
      input: {
        operation: "update",
        id: record.id,
        status: result.status,
        outcome: result.outcome,
        error: null,
      },
    })

    if (isRetryableBlackcatOutcome(result.outcome)) {
      return {
        statusCode: 503,
        body: { error: "payment_reconciliation_deferred", result: result.outcome },
      }
    }

    return {
      statusCode: 200,
      body: { received: true, event: input.event, result: result.outcome },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "processing_failed"
    await recordBlackcatWebhookEventWorkflow(req.scope).run({
      input: {
        operation: "update",
        id: record.id,
        status: "failed",
        outcome: "retryable_processing_failed",
        error: message.slice(0, 500),
      },
    })

    return { statusCode: 503, body: { error: "event_processing_failed" } }
  }
}

function isTerminalRecord(record: WebhookRecord) {
  return (
    record.status === "processed" ||
    (record.status === "ignored" && !isRetryableBlackcatOutcome(record.outcome))
  )
}

function isStale(updatedAt?: string | Date) {
  if (!updatedAt) {
    return true
  }

  return Date.now() - new Date(updatedAt).getTime() > 5 * 60 * 1000
}

function hasExpectedTransactionStatus(event: string, data: BlackcatPayload) {
  const expectedStatus: Record<string, string> = {
    "transaction.created": "pending",
    "transaction.paid": "paid",
    "transaction.failed": "cancelled",
    "transaction.cancelled": "cancelled",
    "transaction.refused": "refused",
    "transaction.refunded": "refunded",
    "transaction.pending": "pending",
    "transaction.scheduled": "scheduled",
  }
  const expected = expectedStatus[event]

  if (!expected) {
    return true
  }

  return typeof data.status === "string" && data.status.toLowerCase() === expected
}
