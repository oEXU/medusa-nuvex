import { MedusaService } from "@medusajs/framework/utils"
import BlackcatWebhookEvent from "./models/blackcat-webhook-event"

class BlackcatWebhookEventModuleService extends MedusaService({
  BlackcatWebhookEvent,
}) {}

export default BlackcatWebhookEventModuleService
