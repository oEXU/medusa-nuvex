import { model } from "@medusajs/framework/utils"

const SupportTicket = model.define("support_ticket", {
  id: model.id().primaryKey(),
  name: model.text(),
  whatsapp: model.text(),
  question: model.text(),
})

export default SupportTicket
