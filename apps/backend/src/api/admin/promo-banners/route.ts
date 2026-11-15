import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import {
  PROMO_BANNER_MODULE,
} from "../../../modules/promo-banner"
import type PromoBannerModuleService from "../../../modules/promo-banner/service"

const promoBannerSchema = z
  .object({
    type: z.enum([
      "promotion",
      "weekly_drop",
      "launch",
      "news",
      "announcement",
    ]),
    title: z.string().trim().min(1).max(120),
    subtitle: z.string().trim().max(240).nullable().optional(),
    image_url: z.string().url().max(2048),
    mobile_image_url: z.string().url().max(2048).nullable().optional(),
    alt_text: z.string().trim().min(1).max(180),
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

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const promoBannerService = getPromoBannerService(req)
  const [promo_banners, count] =
    await promoBannerService.listAndCountPromoBanners(
      {},
      {
        order: { sort_order: "ASC", created_at: "DESC" },
      }
    )

  res.json({ promo_banners, count })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = promoBannerSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados inválidos para o banner.",
      errors: parsed.error.issues,
    })
  }

  const promoBannerService = getPromoBannerService(req)
  const promo_banner = await promoBannerService.createPromoBanners({
    ...parsed.data,
    subtitle: parsed.data.subtitle ?? null,
    mobile_image_url: parsed.data.mobile_image_url ?? null,
    link_url: parsed.data.link_url || null,
    cta_label: parsed.data.cta_label || null,
    sort_order: parsed.data.sort_order ?? 0,
    is_active: parsed.data.is_active ?? true,
    starts_at: parsed.data.starts_at
      ? new Date(parsed.data.starts_at)
      : null,
    ends_at: parsed.data.ends_at ? new Date(parsed.data.ends_at) : null,
  })

  res.status(201).json({ promo_banner })
}
