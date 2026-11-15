import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import {
  PROMO_BANNER_MODULE,
} from "../../../../modules/promo-banner"
import type PromoBannerModuleService from "../../../../modules/promo-banner/service"

const promoBannerUpdateSchema = z
  .object({
    type: z
      .enum(["promotion", "weekly_drop", "launch", "news", "announcement"])
      .optional(),
    title: z.string().trim().min(1).max(120).optional(),
    subtitle: z.string().trim().max(240).nullable().optional(),
    image_url: z.string().url().max(2048).optional(),
    mobile_image_url: z.string().url().max(2048).nullable().optional(),
    alt_text: z.string().trim().min(1).max(180).optional(),
    link_url: z.string().trim().max(2048).nullable().optional(),
    cta_label: z.string().trim().max(40).nullable().optional(),
    sort_order: z.number().int().min(0).max(10000).optional(),
    is_active: z.boolean().optional(),
    starts_at: z.string().datetime().nullable().optional(),
    ends_at: z.string().datetime().nullable().optional(),
  })
  .strict()

const getPromoBannerService = (req: MedusaRequest) =>
  req.scope.resolve<PromoBannerModuleService>(PROMO_BANNER_MODULE)

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = promoBannerUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados inválidos para o banner.",
      errors: parsed.error.issues,
    })
  }

  const promoBannerService = getPromoBannerService(req)
  const promo_banner = await promoBannerService.updatePromoBanners({
    id: req.params.id,
    ...parsed.data,
    link_url: parsed.data.link_url || null,
    cta_label: parsed.data.cta_label || null,
    starts_at: parsed.data.starts_at
      ? new Date(parsed.data.starts_at)
      : null,
    ends_at: parsed.data.ends_at ? new Date(parsed.data.ends_at) : null,
  })

  res.json({ promo_banner })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const promoBannerService = getPromoBannerService(req)
  await promoBannerService.deletePromoBanners(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
