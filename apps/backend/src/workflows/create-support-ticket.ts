import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { SUPPORT_TICKET_MODULE } from "../modules/support-ticket"
import type SupportTicketModuleService from "../modules/support-ticket/service"

type CreateSupportTicketInput = {
  name: string
  whatsapp: string
  question: string
}

const createSupportTicketStep = createStep(
  "create-support-ticket",
  async (input: CreateSupportTicketInput, { container }) => {
    const service = container.resolve<SupportTicketModuleService>(
      SUPPORT_TICKET_MODULE
    )
    const ticket = await service.createSupportTickets(input)

    return new StepResponse(ticket, ticket.id)
  },
  async (ticketId, { container }) => {
    if (!ticketId) {
      return
    }

    const service = container.resolve<SupportTicketModuleService>(
      SUPPORT_TICKET_MODULE
    )
    await service.deleteSupportTickets(ticketId)
  }
)

const createSupportTicketWorkflow = createWorkflow(
  "create-support-ticket",
  (input: CreateSupportTicketInput) => {
    const ticket = createSupportTicketStep(input)

    return new WorkflowResponse(ticket)
  }
)

export default createSupportTicketWorkflow
