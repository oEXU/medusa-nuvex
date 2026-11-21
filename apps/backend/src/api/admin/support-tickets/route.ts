import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SUPPORT_TICKET_MODULE } from "../../../modules/support-ticket"
import type SupportTicketModuleService from "../../../modules/support-ticket/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service =
    req.scope.resolve<SupportTicketModuleService>(SUPPORT_TICKET_MODULE)
  const [support_tickets, count] =
    await service.listAndCountSupportTickets(
      {},
      { order: { created_at: "DESC" } }
    )

  res.json({ support_tickets, count })
}
