import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import deleteSupportTicketWorkflow from "../../../../workflows/delete-support-ticket"

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { result } = await deleteSupportTicketWorkflow(req.scope).run({
    input: { id: req.params.id },
  })

  res.json({ id: result.id, deleted: true })
}
