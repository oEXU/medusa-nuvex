import {
  BLACKCAT_EVENTS,
  getBlackcatExternalReference,
  getBlackcatIdempotencyKey,
  getBlackcatPayloadData,
  getBlackcatRetryPayload,
  getValidatedBlackcatEvent,
  isBlackcatTestEvent,
  isBlackcatChargebackRefund,
  isRetryableBlackcatOutcome,
} from "../helpers"

describe("BlackCat webhook helpers", () => {
  it("supports the complete configured event list", () => {
    expect(BLACKCAT_EVENTS.size).toBe(22)
    expect(BLACKCAT_EVENTS.has("transaction.paid")).toBe(true)
    expect(BLACKCAT_EVENTS.has("med.closed")).toBe(true)
  })

  it("accepts the documented v1 and v3 payload layouts", () => {
    expect(getBlackcatPayloadData({ event: "transaction.paid", transactionId: "tx_1" })).toEqual({
      event: "transaction.paid",
      transactionId: "tx_1",
    })
    expect(getBlackcatPayloadData({ event: "transaction.paid", data: { transactionId: "tx_2" } })).toEqual({
      transactionId: "tx_2",
    })
  })

  it("deduplicates exact retries but keeps changed subscription cycles distinct", () => {
    const body = Buffer.from('{"subscription":{"id":"sub_1"},"cycle":"2"}')
    const nextBody = Buffer.from('{"subscription":{"id":"sub_1"},"cycle":"3"}')

    const first = getBlackcatIdempotencyKey(
      "subscription.renewed",
      { subscription: { id: "sub_1" }, cycle: "2" },
      "sub_1",
      body
    )
    const retry = getBlackcatIdempotencyKey(
      "subscription.renewed",
      { subscription: { id: "sub_1" }, cycle: "2" },
      "sub_1",
      body
    )
    const nextCycle = getBlackcatIdempotencyKey(
      "subscription.renewed",
      { subscription: { id: "sub_1" }, cycle: "3" },
      "sub_1",
      nextBody
    )

    expect(retry).toBe(first)
    expect(nextCycle).not.toBe(first)
  })

  it("keeps changed refund notifications distinct while deduplicating exact retries", () => {
    const ordinaryRefund = Buffer.from(
      '{"event":"transaction.refunded","data":{"transactionId":"tx_1","chargeback":false}}'
    )
    const chargebackRefund = Buffer.from(
      '{"event":"transaction.refunded","data":{"transactionId":"tx_1","chargeback":true}}'
    )

    const first = getBlackcatIdempotencyKey(
      "transaction.refunded",
      { transactionId: "tx_1", chargeback: false },
      "tx_1",
      ordinaryRefund
    )
    const retry = getBlackcatIdempotencyKey(
      "transaction.refunded",
      { transactionId: "tx_1", chargeback: false },
      "tx_1",
      ordinaryRefund
    )
    const chargeback = getBlackcatIdempotencyKey(
      "transaction.refunded",
      { transactionId: "tx_1", chargeback: true },
      "tx_1",
      chargebackRefund
    )

    expect(retry).toBe(first)
    expect(chargeback).not.toBe(first)
  })

  it("uses the Medusa payment session ID unchanged as the BlackCat external reference", () => {
    expect(getBlackcatExternalReference("payses_01abc123")).toBe("payses_01abc123")
  })

  it("requires the event header to match the signed payload event", () => {
    const payload = { event: "transaction.paid", data: { status: "paid" } }

    expect(getValidatedBlackcatEvent("transaction.paid", payload)).toBe("transaction.paid")
    expect(getValidatedBlackcatEvent("transaction.refunded", payload)).toBeUndefined()
    expect(getValidatedBlackcatEvent(undefined, payload)).toBeUndefined()
    expect(getValidatedBlackcatEvent("transaction.paid", { data: {} })).toBeUndefined()
  })

  it("identifies chargeback refunds so they bypass ordinary refund handling", () => {
    expect(isBlackcatChargebackRefund("transaction.refunded", { chargeback: true })).toBe(true)
    expect(isBlackcatChargebackRefund("transaction.refunded", { chargeback: false })).toBe(false)
    expect(isBlackcatChargebackRefund("chargeback.opened", { chargeback: true })).toBe(false)
  })

  it("recognizes only an explicit boolean test marker", () => {
    expect(isBlackcatTestEvent({ test: true })).toBe(true)
    expect(isBlackcatTestEvent({ test: "true" })).toBe(false)
    expect(isBlackcatTestEvent({})).toBe(false)
  })

  it("marks unresolved events retryable and stores only reconciliation fields", () => {
    const retryData = getBlackcatRetryPayload({
      transactionId: "tx_1",
      externalReference: "pay_1",
      status: "paid",
      amount: 2500,
      refundedAmount: 0,
      chargeback: false,
      customer: { email: "buyer@example.com" },
    })

    expect(isRetryableBlackcatOutcome("retryable_medusa_payment_not_found")).toBe(true)
    expect(isRetryableBlackcatOutcome("payment_captured")).toBe(false)
    expect(retryData).toEqual({
      transactionId: "tx_1",
      externalReference: "pay_1",
      status: "paid",
      amount: 2500,
      refundedAmount: 0,
      chargeback: false,
    })
  })
})
