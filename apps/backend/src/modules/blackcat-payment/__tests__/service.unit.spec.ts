import type {
  CapturePaymentInput,
  InitiatePaymentInput,
  ProviderWebhookPayload,
} from "@medusajs/framework/types"
import BlackcatPaymentProviderService from "../service"

const createProvider = () => {
  const Provider = BlackcatPaymentProviderService as unknown as new (
    cradle: Record<string, unknown>,
    options: { apiKey: string; postbackUrl: string }
  ) => BlackcatPaymentProviderService
  return new Provider({}, {
    apiKey: "unit-test-secret",
    postbackUrl: "https://nuvexgames.com/webhooks/blackcat",
  })
}

describe("BlackCat payment provider", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("creates a Pix sale and returns BlackCat's hosted checkout URL", async () => {
    const fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        success: true,
        data: {
          transactionId: "bc_tx_1",
          status: "PENDING",
          paymentMethod: "PIX",
          amount: 4990,
          invoiceUrl: "https://blackcat.squarify.co/checkout/bc_tx_1",
        },
      }), { status: 201 })
    )
    const provider = createProvider()
    const input = {
      amount: 49.9,
      currency_code: "brl",
      context: { idempotency_key: "payses_123" },
      data: {
        originToken: "origin-token-test",
        customer: {
          name: "Maria Nuvex",
          email: "maria@example.com",
          phone: "+5511999999999",
          document: { number: "123.456.789-00", type: "cpf" },
        },
      },
    } as unknown as InitiatePaymentInput

    const result = await provider.initiatePayment(input)

    expect(result).toMatchObject({
      id: "bc_tx_1",
      status: "pending",
      data: {
        id: "bc_tx_1",
        externalReference: "payses_123",
        transactionId: "bc_tx_1",
        invoiceUrl: "https://blackcat.squarify.co/checkout/bc_tx_1",
      },
    })
    expect(result.data).not.toHaveProperty("pix")
    expect(result.data).not.toHaveProperty("originToken")
    const [url, request] = fetchSpy.mock.calls[0]
    expect(url).toBe("https://api.blackcatoficial.com/api/sales/create-sale")
    expect(request?.headers).toMatchObject({
      "X-API-Key": "unit-test-secret",
    })
    expect(JSON.parse(String(request?.body))).toMatchObject({
      amount: 4990,
      currency: "BRL",
      paymentMethod: "pix",
      externalRef: "payses_123",
      postbackUrl: "https://nuvexgames.com/webhooks/blackcat",
      originToken: "origin-token-test",
      customer: {
        phone: "5511999999999",
        document: { number: "12345678900", type: "cpf" },
      },
    })
    expect(JSON.parse(String(request?.body))).toHaveProperty(
      "originToken",
      "origin-token-test"
    )
  })

  it("requires a browser origin token before requesting a Pix sale", async () => {
    const fetchSpy = jest.spyOn(globalThis, "fetch")
    const provider = createProvider()

    await expect(provider.initiatePayment({
      amount: 49.9,
      currency_code: "brl",
      context: { idempotency_key: "payses_missing_origin" },
      data: {
        customer: {
          name: "Maria Nuvex",
          email: "maria@example.com",
          phone: "+5511999999999",
          document: { number: "12345678900", type: "cpf" },
        },
      },
    } as unknown as InitiatePaymentInput)).rejects.toThrow(
      "BlackCat payment is missing originToken."
    )
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("rejects a sale response without a hosted invoice URL", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        success: true,
        data: {
          transactionId: "bc_tx_2",
          status: "PENDING",
          paymentMethod: "PIX",
          amount: 4990,
        },
      }), { status: 201 })
    )
    const provider = createProvider()

    await expect(provider.initiatePayment({
      amount: 49.9,
      currency_code: "brl",
      context: { idempotency_key: "payses_456" },
      data: {
        originToken: "origin-token-test",
        customer: {
          name: "Maria Nuvex",
          email: "maria@example.com",
          phone: "+5511999999999",
          document: { number: "12345678900", type: "cpf" },
        },
      },
    } as unknown as InitiatePaymentInput)).rejects.toThrow(
      "BlackCat returned an incomplete hosted Pix checkout response."
    )
  })

  it("rejects a hosted invoice URL outside BlackCat's documented checkout host", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        success: true,
        data: {
          transactionId: "bc_tx_3",
          status: "PENDING",
          paymentMethod: "PIX",
          amount: 4990,
          invoiceUrl: "https://nuvexgames.com/checkout/bc_tx_3",
        },
      }), { status: 201 })
    )
    const provider = createProvider()

    await expect(provider.initiatePayment({
      amount: 49.9,
      currency_code: "brl",
      context: { idempotency_key: "payses_789" },
      data: {
        originToken: "origin-token-test",
        customer: {
          name: "Maria Nuvex",
          email: "maria@example.com",
          phone: "+5511999999999",
          document: { number: "12345678900", type: "cpf" },
        },
      },
    } as unknown as InitiatePaymentInput)).rejects.toThrow(
      "BlackCat returned an incomplete hosted Pix checkout response."
    )
  })

  it("refuses to capture unless BlackCat status is PAID", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        success: true,
        data: { transactionId: "bc_tx_1", status: "PENDING" },
      }), {
        status: 200,
      })
    )
    const provider = createProvider()

    await expect(
      provider.capturePayment({
        data: { id: "bc_tx_1" },
      } satisfies CapturePaymentInput)
    ).rejects.toThrow("BlackCat has not confirmed this Pix payment as paid.")
  })

  it("accepts the documented flat BlackCat paid webhook after status verification", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        success: true,
        data: { transactionId: "bc_tx_1", status: "PAID" },
      }), { status: 200 })
    )
    const provider = createProvider()

    await expect(provider.getWebhookActionAndData({
      data: {
        event: "transaction.paid",
        transactionId: "bc_tx_1",
        externalReference: "payses_123",
        amount: 4990,
      },
      headers: { "x-webhook-event": "transaction.paid" },
    } as unknown as ProviderWebhookPayload["payload"])).resolves.toEqual({
      action: "captured",
      data: { session_id: "payses_123", amount: 49.9 },
    })
  })
})
