import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import { AbstractPaymentProvider, MedusaError } from "@medusajs/framework/utils"

type BlackcatOptions = {
  apiKey?: string
  postbackUrl?: string
}

type BlackcatSaleData = {
  id: string
  amount: number
  status: string
  paymentMethod: string
  invoiceUrl: string
  paymentData: {
    qrCode?: string
    qrCodeBase64?: string
    copyPaste?: string
    expiresAt?: string
  }
}

const API_URL = "https://api.blackcatoficial.com/api"

class BlackcatPaymentProviderService extends AbstractPaymentProvider<BlackcatOptions> {
  static identifier = "blackcat"

  constructor(container: Record<string, unknown>, options?: BlackcatOptions) {
    super(container, options)
  }

  static validateOptions(options: BlackcatOptions) {
    if (!options.apiKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "BLACKCAT_API_KEY is required to configure the BlackCat payment provider."
      )
    }
  }

  private get apiKey() {
    if (!this.config.apiKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "BlackCat payment credentials are not configured."
      )
    }
    return this.config.apiKey
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const sessionId = input.context?.idempotency_key
    if (!sessionId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Medusa payment session ID is required for the BlackCat external reference."
      )
    }

    const details = getCustomerDetails(input.data)
    const originToken = requiredString(input.data?.originToken, "originToken")
    const blackcatMinorUnits = Math.round(Number(input.amount) * 100)
    if (!Number.isFinite(blackcatMinorUnits) || blackcatMinorUnits <= 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "BlackCat Pix requires a positive payment amount."
      )
    }

    const requestBody = {
      amount: blackcatMinorUnits,
      paymentMethod: "pix",
      originToken,
      items: getSaleItems(input.data, blackcatMinorUnits),
      customer: details,
      externalRef: sessionId,
      currency: "BRL",
      pix: { expiresInDays: 1 },
      ...getShipping(input.data),
      ...(this.config.postbackUrl ? { postbackUrl: this.config.postbackUrl } : {}),
    }

    const response = await this.request("/sales/create-sale", {
      method: "POST",
      body: JSON.stringify(requestBody),
    })
    const sale = parseSaleData(response)

    if (sale.amount !== blackcatMinorUnits || sale.paymentMethod.toLowerCase() !== "pix") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "BlackCat returned a Pix charge with an unexpected amount or payment method."
      )
    }

    return {
      id: sale.id,
      status: "pending",
      data: {
        id: sale.id,
        externalReference: sessionId,
        amount: sale.amount,
        status: sale.status,
        paymentMethod: sale.paymentMethod,
        invoiceUrl: sale.invoiceUrl,
        paymentData: sale.paymentData,
        transactionId: sale.id,
        customer: null,
        items: null,
        shipping: null,
      },
    }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const transactionId = getTransactionId(input.data)
    const status = await this.getTransactionStatus(transactionId)
    return { status: toSessionStatus(status), data: input.data }
  }

  async deletePayment(_input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return {}
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const transactionId = getTransactionId(input.data)
    const status = await this.getTransactionStatus(transactionId)
    if (status === "PAID") {
      return {
        status: "authorized",
        data: input.data,
      }
    }
    if (status === "CANCELLED" || status === "REFUNDED") {
      return { status: "canceled", data: input.data }
    }
    return { status: "pending_authorization", data: input.data }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    const transactionId = getTransactionId(input.data)
    const status = await this.getTransactionStatus(transactionId)
    if (status !== "PAID") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "BlackCat has not confirmed this Pix payment as paid."
      )
    }
    return { data: input.data }
  }

  async refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    const transactionId = getTransactionId(input.data)
    const status = await this.getTransactionStatus(transactionId)
    if (status !== "REFUNDED") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "BlackCat does not document a Pix refund endpoint; refund status must be confirmed by its API first."
      )
    }
    return { data: input.data }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    const transactionId = getTransactionId(input.data)
    const response = await this.getSale(transactionId)
    return { data: asRecord(response) }
  }

  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    const transactionId = getTransactionId(input.data)
    const status = await this.getTransactionStatus(transactionId)
    if (status !== "CANCELLED") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "BlackCat has not confirmed cancellation of this transaction."
      )
    }
    return { data: input.data }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const status = await this.getTransactionStatus(getTransactionId(input.data))
    return { status: toSessionStatus(status) }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const body = asRecord(payload.data)
    const event = readString(body.event) ?? readString(payload.headers["x-webhook-event"])
    const nestedData = asRecord(body.data)
    const data = Object.keys(nestedData).length > 0 ? nestedData : body
    const sessionId = readString(data.externalReference)
    const transactionId = readString(data.transactionId)
    const amount = typeof data.amount === "number" ? data.amount / 100 : undefined

    if (
      event !== "transaction.paid" ||
      !sessionId ||
      !transactionId ||
      amount === undefined
    ) {
      return { action: "not_supported" }
    }

    const status = await this.getTransactionStatus(transactionId)
    if (status !== "PAID") {
      return { action: "not_supported" }
    }
    return {
      action: "captured",
      data: { session_id: sessionId, amount },
    }
  }

  private async getSale(transactionId: string): Promise<unknown> {
    return this.request(`/sales/${encodeURIComponent(transactionId)}/status`, {
      method: "GET",
    })
  }

  private async getTransactionStatus(transactionId: string): Promise<string> {
    const result = asRecord(await this.getSale(transactionId))
    const data = asRecord(result.data)
    const returnedTransactionId = readString(data.transactionId) ?? readString(result.transactionId)
    const status = readString(data.status) ?? readString(result.status)
    if (!status || returnedTransactionId !== transactionId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "BlackCat returned a transaction status that does not match the requested transaction."
      )
    }
    return status.toUpperCase()
  }

  private async request(path: string, init: RequestInit): Promise<unknown> {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
        ...init.headers,
      },
    })
    const responseBody: unknown = await response.json().catch(() => undefined)
    if (!response.ok) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `BlackCat API request failed with HTTP ${response.status}.`
      )
    }
    return responseBody
  }
}

function getCustomerDetails(data: Record<string, unknown> | undefined) {
  const customer = asRecord(data?.customer)
  const document = asRecord(customer.document)
  const name = requiredString(customer.name, "customer.name")
  const email = requiredString(customer.email, "customer.email")
  const phone = requiredString(customer.phone, "customer.phone")
  const cpf = requiredString(document.number, "customer.document.number")
  const normalizedPhone = phone.replace(/\D/g, "")
  if (!normalizedPhone) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "BlackCat payment is missing customer.phone."
    )
  }
  return {
    name,
    email,
    phone: normalizedPhone,
    document: { number: cpf.replace(/\D/g, ""), type: "cpf" },
  }
}

function getSaleItems(data: Record<string, unknown> | undefined, amountInCents: number) {
  const items = Array.isArray(data?.items) ? data.items : []
  if (items.length === 0) {
    return [{ title: "Pedido Nuvex", unitPrice: amountInCents, quantity: 1, tangible: false }]
  }

  return items.map((item) => {
    const value = asRecord(item)
    const title = requiredString(value.title, "items.title")
    const unitPrice = Number(value.unitPrice)
    const quantity = Number(value.quantity)
    if (!Number.isSafeInteger(unitPrice) || unitPrice <= 0 || !Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "BlackCat item details are invalid.")
    }
    return { title, unitPrice, quantity, tangible: value.tangible === true }
  })
}

function getShipping(data: Record<string, unknown> | undefined) {
  const items = Array.isArray(data?.items) ? data.items : []
  if (!items.some((item) => asRecord(item).tangible === true)) {
    return {}
  }
  const shipping = asRecord(data?.shipping)
  const requiredFields = ["name", "street", "number", "neighborhood", "city", "state", "zipCode"] as const
  const result = Object.fromEntries(
    requiredFields.map((field) => [field, requiredString(shipping[field], `shipping.${field}`)])
  )
  const normalizedState = result.state.trim().toLocaleLowerCase("pt-BR")
  const stateCodes: Record<string, string> = {
    "acre": "AC", "alagoas": "AL", "amapa": "AP", "amazonas": "AM",
    "bahia": "BA", "ceara": "CE", "distrito federal": "DF", "espirito santo": "ES",
    "goias": "GO", "maranhao": "MA", "mato grosso": "MT", "mato grosso do sul": "MS",
    "minas gerais": "MG", "para": "PA", "paraiba": "PB", "parana": "PR",
    "pernambuco": "PE", "piaui": "PI", "rio de janeiro": "RJ", "rio grande do norte": "RN",
    "rio grande do sul": "RS", "rondonia": "RO", "roraima": "RR", "santa catarina": "SC",
    "sao paulo": "SP", "sergipe": "SE", "tocantins": "TO",
  }
  const uf = normalizedState.length === 2
    ? normalizedState.toUpperCase()
    : stateCodes[normalizedState.normalize("NFD").replace(/[\u0300-\u036f]/g, "")]
  if (!uf) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "BlackCat shipping state must be a two-letter UF.")
  }
  result.state = uf
  const complement = readString(shipping.complement)
  return { shipping: { ...result, ...(complement ? { complement } : {}) } }
}

function getTransactionId(data: Record<string, unknown> | undefined) {
  return requiredString(data?.id, "BlackCat transaction ID")
}

function requiredString(value: unknown, label: string) {
  const result = readString(value)
  if (!result) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `BlackCat payment is missing ${label}.`
    )
  }
  return result
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function parseSaleData(value: unknown): BlackcatSaleData {
  const root = asRecord(value)
  const data = asRecord(root.data)
  const id = readString(data.transactionId)
  const amount = data.amount
  const status = readString(data.status)
  const paymentMethod = readString(data.paymentMethod)
  const invoiceUrl = getHostedCheckoutUrl(data.invoiceUrl)
  const paymentData = asRecord(data.paymentData)
  if (
    root.success !== true ||
    !id ||
    typeof amount !== "number" ||
    !status ||
    !paymentMethod ||
    !invoiceUrl
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "BlackCat returned an incomplete hosted Pix checkout response."
    )
  }
  return {
    id,
    amount,
    status,
    paymentMethod,
    invoiceUrl,
    paymentData: {
      qrCode: readString(paymentData.qrCode),
      qrCodeBase64: readString(paymentData.qrCodeBase64),
      copyPaste: readString(paymentData.copyPaste),
      expiresAt: readString(paymentData.expiresAt),
    },
  }
}

function getHostedCheckoutUrl(value: unknown): string | undefined {
  const invoiceUrl = readString(value)
  if (!invoiceUrl) {
    return undefined
  }

  try {
    const parsedUrl = new URL(invoiceUrl)
    if (
      parsedUrl.origin !== "https://blackcat.squarify.co" ||
      parsedUrl.username ||
      parsedUrl.password
    ) {
      return undefined
    }
    return invoiceUrl
  } catch {
    return undefined
  }
}

function toSessionStatus(status: string): "captured" | "pending" | "canceled" | "error" {
  switch (status) {
    case "PAID":
      return "captured"
    case "CANCELLED":
    case "REFUNDED":
      return "canceled"
    case "PENDING":
    case "PROCESSING":
      return "pending"
    default:
      return "error"
  }
}

export default BlackcatPaymentProviderService
