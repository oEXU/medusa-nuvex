import { model } from "@medusajs/framework/utils"

const BlackcatWebhookEvent = model
  .define("blackcat_webhook_event", {
    id: model.id().primaryKey(),
    idempotency_key: model.text().unique(),
    event_type: model.text(),
    entity_id: model.text().nullable(),
    body_hash: model.text(),
    status: model.enum(["processing", "processed", "ignored", "failed"]),
    outcome: model.text().nullable(),
    error: model.text().nullable(),
    payload: model.json().nullable(),
  })
  .indexes([{ on: ["event_type"] }])

export default BlackcatWebhookEvent
