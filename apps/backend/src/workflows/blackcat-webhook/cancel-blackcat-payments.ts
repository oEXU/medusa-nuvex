import { cancelPaymentStep } from "@medusajs/medusa/core-flows"
import { createWorkflow, transform } from "@medusajs/framework/workflows-sdk"

export const cancelBlackcatPaymentsWorkflow = createWorkflow(
  "cancel-blackcat-payments",
  (input: { paymentIds: string[] }) => {
    const paymentIds = transform({ input }, ({ input }) => input.paymentIds)
    cancelPaymentStep({ paymentIds })
  }
)
