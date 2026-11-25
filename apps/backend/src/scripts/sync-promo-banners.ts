import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PROMO_BANNER_MODULE } from "../modules/promo-banner"
import type PromoBannerModuleService from "../modules/promo-banner/service"
import catalog from "../data/catalog-export.json"

export default async function syncPromoBanners({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<PromoBannerModuleService>(PROMO_BANNER_MODULE)
  const [existing] = await service.listAndCountPromoBanners({}, { take: 1000 })
  let created = 0
  let updated = 0

  for (const banner of catalog.promoBanners) {
    const imageName = new URL(banner.image_url).pathname.split("/").pop()
    if (!imageName) throw new Error(`Banner image is missing for ${banner.title}`)
    const payload = {
      type: banner.type,
      title: banner.title,
      subtitle: banner.subtitle,
      image_url: `https://nuvexgames.com/${imageName}`,
      mobile_image_url: banner.mobile_image_url
        ? `https://nuvexgames.com/${new URL(banner.mobile_image_url).pathname.split("/").pop()}`
        : null,
      image_only: banner.image_only,
      alt_text: banner.alt_text,
      link_url: banner.link_url,
      cta_label: banner.cta_label,
      sort_order: banner.sort_order,
      is_active: banner.is_active,
      starts_at: banner.starts_at ? new Date(banner.starts_at) : null,
      ends_at: banner.ends_at ? new Date(banner.ends_at) : null,
    }
    const match = existing.find((item) => item.title === banner.title)
    if (match) {
      await service.updatePromoBanners({ id: match.id, ...payload })
      updated++
    } else {
      await service.createPromoBanners(payload)
      created++
    }
  }

  logger.info(`Promo banners synced: ${created} created, ${updated} updated.`)
}
