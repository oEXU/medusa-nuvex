import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { SUPPORT_TICKET_MODULE } from "../modules/support-ticket"
import type SupportTicketModuleService from "../modules/support-ticket/service"

type DeleteSupportTicketInput = {
  id: string
}

const deleteSupportTicketStep = createStep(
  "delete-support-ticket",
  async ({ id }: DeleteSupportTicketInput, { container }) => {
    const service = container.resolve<SupportTicketModuleService>(
      SUPPORT_TICKET_MODULE
    )
    await service.deleteSupportTickets(id)

    return new StepResponse({ id })
  }
)

const deleteSupportTicketWorkflow = createWorkflow(
  "delete-support-ticket",
  (input: DeleteSupportTicketInput) => {
    const result = deleteSupportTicketStep(input)

    return new WorkflowResponse(result)
  }
)

export default deleteSupportTicketWorkflow
