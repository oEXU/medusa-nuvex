jest.mock("@medusajs/medusa/core-flows", () => ({
  processPaymentWorkflow: jest.fn(),
  refundPaymentWorkflow: jest.fn(),
}))

jest.mock("../../../workflows/blackcat-webhook/cancel-blackcat-payments", () => ({
  cancelBlackcatPaymentsWorkflow: jest.fn(),
}))

jest.mock("../../../workflows/blackcat-webhook/update-payment-session", () => ({
  updateBlackcatPaymentSessionWorkflow: jest.fn(),
}))

import {
  processPaymentWorkflow,
  refundPaymentWorkflow,
} from "@medusajs/medusa/core-flows"
import type { MedusaContainer } from "@medusajs/framework/types"
import { updateBlackcatPaymentSessionWorkflow } from "../../../workflows/blackcat-webhook/update-payment-session"
import { reconcileBlackcatEvent } from "../reconcile"

describe("BlackCat payment reconciliation", () => {
  const captureRun = jest.fn()
  const refundRun = jest.fn()
  const updateSessionRun = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(processPaymentWorkflow as unknown as jest.Mock).mockReturnValue({ run: captureRun })
    ;(refundPaymentWorkflow as unknown as jest.Mock).mockReturnValue({ run: refundRun })
    ;(updateBlackcatPaymentSessionWorkflow as unknown as jest.Mock).mockReturnValue({
      run: updateSessionRun,
    })
  })

  it("does not run an ordinary refund workflow for a chargeback refund event", async () => {
    const resolve = jest.fn()
    const container = { resolve } as unknown as MedusaContainer

    await expect(
      reconcileBlackcatEvent(
        container,
        "transaction.refunded",
        { status: "refunded", chargeback: true },
        "event-key"
      )
    ).resolves.toEqual({ status: "processed", outcome: "chargeback_recorded" })

    expect(resolve).not.toHaveBeenCalled()
    expect(refundPaymentWorkflow).not.toHaveBeenCalled()
    expect(refundRun).not.toHaveBeenCalled()
  })

  it("reconciles a payment session from its exact external reference", async () => {
    process.env.BLACKCAT_API_KEY = "unit-test-key"
    jest.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: { transactionId: "bc_tx_123", status: "PAID" },
    }), { status: 200 }))
    const paymentModule = {
      retrievePaymentSession: jest.fn().mockResolvedValue({
        id: "payses_123",
        amount: 25,
        currency_code: "brl",
        provider_id: "pp_blackcat_blackcat",
        status: "pending",
        data: { id: "bc_tx_123", transactionId: "bc_tx_123" },
      }),
      listPayments: jest.fn().mockResolvedValue([]),
    }
    const container = {
      resolve: jest.fn().mockReturnValue(paymentModule),
    } as unknown as MedusaContainer

    await expect(
      reconcileBlackcatEvent(
        container,
        "transaction.paid",
        {
          transactionId: "bc_tx_123",
          status: "paid",
          amount: 2500,
          externalReference: "payses_123",
        },
        "event-key"
      )
    ).resolves.toEqual({ status: "processed", outcome: "payment_captured" })

    expect(paymentModule.retrievePaymentSession).toHaveBeenCalledWith("payses_123")
    expect(fetch).toHaveBeenCalledWith(
      "https://api.blackcatoficial.com/api/sales/bc_tx_123/status",
      { headers: { "X-API-Key": "unit-test-key" } }
    )
    expect(processPaymentWorkflow).toHaveBeenCalledWith(container)
    expect(captureRun).toHaveBeenCalledWith({
      input: {
        action: "captured",
        data: { session_id: "payses_123", amount: 25 },
      },
    })
  })

  it("returns a retryable result when the payment is not available yet", async () => {
    const paymentModule = {
      retrievePaymentSession: jest.fn().mockRejectedValue(new Error("Not found")),
    }
    const container = {
      resolve: jest.fn().mockReturnValue(paymentModule),
    } as unknown as MedusaContainer

    await expect(
      reconcileBlackcatEvent(
        container,
        "transaction.paid",
        {
          status: "paid",
          amount: 2500,
          externalReference: "pay_appears_later",
        },
        "event-key"
      )
    ).resolves.toEqual({
      status: "ignored",
      outcome: "retryable_medusa_payment_session_not_found",
    })
    expect(processPaymentWorkflow).not.toHaveBeenCalled()
  })

  it("does not reconcile a session belonging to a different provider", async () => {
    const paymentModule = {
      retrievePaymentSession: jest.fn().mockResolvedValue({
        id: "payses_other",
        amount: 25,
        currency_code: "brl",
        provider_id: "pp_stripe_stripe",
      }),
    }
    const container = {
      resolve: jest.fn().mockReturnValue(paymentModule),
    } as unknown as MedusaContainer

    await expect(
      reconcileBlackcatEvent(
        container,
        "transaction.paid",
        { amount: 2500, externalReference: "payses_other" },
        "event-key"
      )
    ).resolves.toEqual({
      status: "ignored",
      outcome: "retryable_payment_provider_mismatch",
    })
    expect(processPaymentWorkflow).not.toHaveBeenCalled()
  })

  it("does not associate a webhook with a different BlackCat transaction", async () => {
    const paymentModule = {
      retrievePaymentSession: jest.fn().mockResolvedValue({
        id: "payses_123",
        amount: 25,
        currency_code: "brl",
        provider_id: "pp_blackcat_blackcat",
        data: { transactionId: "bc_tx_expected" },
      }),
    }
    const container = {
      resolve: jest.fn().mockReturnValue(paymentModule),
    } as unknown as MedusaContainer

    await expect(
      reconcileBlackcatEvent(
        container,
        "transaction.paid",
        {
          transactionId: "bc_tx_other",
          status: "paid",
          amount: 2500,
          externalReference: "payses_123",
        },
        "event-key"
      )
    ).resolves.toEqual({
      status: "ignored",
      outcome: "retryable_transaction_session_mismatch",
    })
    expect(fetch).not.toHaveBeenCalled()
    expect(processPaymentWorkflow).not.toHaveBeenCalled()
  })

  it("does not refund until BlackCat confirms the transaction as REFUNDED", async () => {
    process.env.BLACKCAT_API_KEY = "unit-test-key"
    jest.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: { transactionId: "bc_tx_123", status: "PAID" },
    }), { status: 200 }))
    const paymentModule = {
      retrievePaymentSession: jest.fn().mockResolvedValue({
        id: "payses_123",
        amount: 25,
        currency_code: "brl",
        provider_id: "pp_blackcat_blackcat",
        status: "pending",
        data: { transactionId: "bc_tx_123" },
      }),
      listPayments: jest.fn().mockResolvedValue([
        { id: "pay_123", refunded_amount: 0 },
      ]),
    }
    const container = {
      resolve: jest.fn().mockReturnValue(paymentModule),
    } as unknown as MedusaContainer

    await expect(
      reconcileBlackcatEvent(
        container,
        "transaction.refunded",
        {
          transactionId: "bc_tx_123",
          status: "refunded",
          amount: 2500,
          refundedAmount: 2500,
          externalReference: "payses_123",
        },
        "event-key"
      )
    ).resolves.toEqual({
      status: "ignored",
      outcome: "retryable_blackcat_status_not_refunded",
    })
    expect(refundPaymentWorkflow).not.toHaveBeenCalled()
    expect(refundRun).not.toHaveBeenCalled()
  })

  it("updates a canceled session through Medusa's payment-session workflow", async () => {
    process.env.BLACKCAT_API_KEY = "unit-test-key"
    jest.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: { transactionId: "bc_tx_123", status: "CANCELLED" },
    }), { status: 200 }))
    const sessionData = { id: "bc_tx_123", transactionId: "bc_tx_123" }
    const paymentModule = {
      retrievePaymentSession: jest.fn().mockResolvedValue({
        id: "payses_123",
        amount: 25,
        currency_code: "brl",
        provider_id: "pp_blackcat_blackcat",
        status: "pending_authorization",
        data: sessionData,
      }),
      listPayments: jest.fn().mockResolvedValue([]),
    }
    const container = {
      resolve: jest.fn().mockReturnValue(paymentModule),
    } as unknown as MedusaContainer

    await expect(
      reconcileBlackcatEvent(
        container,
        "transaction.cancelled",
        {
          transactionId: "bc_tx_123",
          status: "cancelled",
          amount: 2500,
          externalReference: "payses_123",
        },
        "event-key"
      )
    ).resolves.toEqual({ status: "processed", outcome: "payment_cancelled" })

    expect(updateBlackcatPaymentSessionWorkflow).toHaveBeenCalledWith(container)
    expect(updateSessionRun).toHaveBeenCalledWith({
      input: {
        id: "payses_123",
        amount: 25,
        currency_code: "brl",
        data: sessionData,
      },
    })
  })
})
