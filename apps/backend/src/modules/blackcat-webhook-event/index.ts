import { Module } from "@medusajs/framework/utils"
import BlackcatWebhookEventModuleService from "./service"

export const BLACKCAT_WEBHOOK_EVENT_MODULE = "blackcatWebhookEvent"

export default Module(BLACKCAT_WEBHOOK_EVENT_MODULE, {
  service: BlackcatWebhookEventModuleService,
})
