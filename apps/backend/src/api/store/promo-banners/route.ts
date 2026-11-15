import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PROMO_BANNER_MODULE } from "../../../modules/promo-banner"
import type PromoBannerModuleService from "../../../modules/promo-banner/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const promoBannerService =
    req.scope.resolve<PromoBannerModuleService>(PROMO_BANNER_MODULE)
  const [banners] = await promoBannerService.listAndCountPromoBanners(
    { is_active: true },
    { order: { sort_order: "ASC", created_at: "DESC" } }
  )
  const now = Date.now()
  const promo_banners = banners.filter((banner) => {
    const startsAt = banner.starts_at
      ? new Date(banner.starts_at).getTime()
      : null
    const endsAt = banner.ends_at ? new Date(banner.ends_at).getTime() : null

    return (
      (startsAt === null || startsAt <= now) &&
      (endsAt === null || endsAt >= now)
    )
  })

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60")
  res.json({ promo_banners })
}
