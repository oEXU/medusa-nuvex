import type { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { reconcileBlackcatEvent } from "../lib/blackcat-webhook/reconcile"
import { isRetryableBlackcatOutcome } from "../api/webhooks/blackcat/helpers"
import { recordBlackcatWebhookEventWorkflow } from "../workflows/blackcat-webhook/record-blackcat-webhook-event"

type RetryableEvent = {
  id: string
  event_type: string
  idempotency_key: string
  status: string
  outcome?: string | null
  error?: string | null
  payload?: Record<string, unknown> | null
  updated_at?: string | Date
}

type WebhookEventService = {
  listBlackcatWebhookEvents: (
    filter: Record<string, unknown>,
    config?: Record<string, unknown>
  ) => Promise<RetryableEvent[]>
}

export default async function reprocessBlackcatWebhookEvents(
  container: MedusaContainer
) {
  const service = container.resolve<WebhookEventService>("blackcatWebhookEvent")
  const locking = container.resolve(Modules.LOCKING)
  const candidates = await Promise.all(
    ["ignored", "failed", "processing"].map((status) =>
      service.listBlackcatWebhookEvents(
        { status },
        { take: 100, order: { updated_at: "ASC" } }
      )
    )
  )

  const now = Date.now()
  const events = candidates
    .flat()
    .filter((event) =>
      event.event_type.startsWith("transaction.") &&
      event.payload &&
      (isRetryableBlackcatOutcome(event.outcome) ||
        event.status === "failed" ||
        (event.status === "processing" && isStale(event.updated_at, now)))
    )

  for (const event of events) {
    try {
      await locking.execute(
        `blackcat-webhook:${event.idempotency_key}`,
        async () => processEvent(container, service, event)
      )
    } catch {
      // Another delivery or worker currently holds the event lock.
    }
  }
}

async function processEvent(
  container: MedusaContainer,
  service: WebhookEventService,
  candidate: RetryableEvent
) {
  const current = (
    await service.listBlackcatWebhookEvents({
      idempotency_key: candidate.idempotency_key,
    })
  )[0]

  if (!current || !current.payload) {
    return
  }
  if (current.status === "processed") {
    return
  }
  if (current.status === "ignored" && !isRetryableBlackcatOutcome(current.outcome)) {
    return
  }
  if (current.status === "processing" && !isStale(current.updated_at, Date.now())) {
    return
  }

  await recordBlackcatWebhookEventWorkflow(container).run({
    input: {
      operation: "update",
      id: current.id,
      status: "processing",
      error: null,
    },
  })

  try {
    const result = await reconcileBlackcatEvent(
      container,
      current.event_type,
      current.payload,
      current.idempotency_key
    )
    await recordBlackcatWebhookEventWorkflow(container).run({
      input: {
        operation: "update",
        id: current.id,
        status: result.status,
        outcome: result.outcome,
        error: null,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "processing_failed"
    await recordBlackcatWebhookEventWorkflow(container).run({
      input: {
        operation: "update",
        id: current.id,
        status: "failed",
        outcome: "retryable_processing_failed",
        error: message.slice(0, 500),
      },
    })
  }
}

function isStale(updatedAt: string | Date | undefined, now: number) {
  if (!updatedAt) {
    return true
  }

  return now - new Date(updatedAt).getTime() > 5 * 60 * 1000
}

export const config = {
  name: "reprocess-blackcat-webhook-events",
  schedule: "*/5 * * * *",
}
