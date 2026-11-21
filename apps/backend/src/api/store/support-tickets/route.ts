import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import createSupportTicketWorkflow from "../../../workflows/create-support-ticket"

const createSupportTicketSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    whatsapp: z
      .string()
      .trim()
      .min(10)
      .max(25)
      .regex(/^[+\d\s().-]+$/)
      .refine((value) => {
        const digitCount = value.replace(/\D/g, "").length
        return digitCount >= 10 && digitCount <= 15
      }),
    question: z.string().trim().min(5).max(2000),
  })
  .strict()

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = createSupportTicketSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: "Confira o nome, o WhatsApp e a dúvida informados.",
      errors: parsed.error.issues,
    })
  }

  const { result } = await createSupportTicketWorkflow(req.scope).run({
    input: parsed.data,
  })

  res.status(201).json({ support_ticket: { id: result.id } })
}
