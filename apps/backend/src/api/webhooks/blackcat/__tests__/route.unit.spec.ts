import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { POST } from "../route"

describe("BlackCat webhook test events", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("acknowledges a marked test payment without resolving services or calling the gateway", async () => {
    const body = {
      event: "transaction.paid",
      test: true,
      transactionId: "TRX-TESTE-EXEMPLO",
      externalReference: "PEDIDO-TESTE-EXEMPLO",
      status: "paid",
    }
    const resolve = jest.fn()
    const fetchSpy = jest.spyOn(globalThis, "fetch")
    const req = {
      rawBody: Buffer.from(JSON.stringify(body)),
      headers: {
        "x-webhook-source": "blackcat-api",
        "x-webhook-event": "transaction.paid",
      },
      body,
      scope: { resolve },
    } as unknown as MedusaRequest
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as MedusaResponse

    await POST(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      received: true,
      event: "transaction.paid",
      test: true,
      result: "test_event_ignored",
    })
    expect(resolve).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
