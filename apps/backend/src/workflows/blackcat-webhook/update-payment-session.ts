import { updatePaymentSessionStep } from "@medusajs/medusa/core-flows"
import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

type UpdateBlackcatPaymentSessionInput = {
  id: string
  amount: number
  currency_code: string
  data: Record<string, unknown>
}

export const updateBlackcatPaymentSessionWorkflow = createWorkflow(
  "update-blackcat-payment-session",
  (input: UpdateBlackcatPaymentSessionInput) =>
    new WorkflowResponse(updatePaymentSessionStep(input))
)
