import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

type RecordWebhookEventInput = {
  operation: "create" | "update"
  id?: string
  idempotency_key?: string
  event_type?: string
  entity_id?: string | null
  body_hash?: string
  status: "processing" | "processed" | "ignored" | "failed"
  outcome?: string | null
  error?: string | null
  payload?: Record<string, unknown> | null
}

const recordBlackcatWebhookEventStep = createStep(
  "record-blackcat-webhook-event",
  async (input: RecordWebhookEventInput, { container }) => {
    const service = container.resolve("blackcatWebhookEvent") as {
      createBlackcatWebhookEvents: (data: Record<string, unknown>) => Promise<unknown>
      updateBlackcatWebhookEvents: (data: Record<string, unknown>) => Promise<unknown>
    }

    if (input.operation === "create") {
      const { operation, id, ...data } = input
      const event = await service.createBlackcatWebhookEvents(data)
      return new StepResponse(event)
    }

    const { operation, ...data } = input
    const event = await service.updateBlackcatWebhookEvents(data)
    return new StepResponse(event)
  }
)

export const recordBlackcatWebhookEventWorkflow = createWorkflow(
  "record-blackcat-webhook-event",
  (input: RecordWebhookEventInput) => {
    return new WorkflowResponse(recordBlackcatWebhookEventStep(input))
  }
)
