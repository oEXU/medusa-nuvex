import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PROMO_BANNER_MODULE } from "../modules/promo-banner"
import type PromoBannerModuleService from "../modules/promo-banner/service"

const BANNER_TITLE = "Black das Blacks"
const BANNER_IMAGE_PATH = "/black-das-blacks.png"

export default async function seedBlackDasBlacksBanner({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const promoBannerService =
    container.resolve<PromoBannerModuleService>(PROMO_BANNER_MODULE)
  const storefrontUrl =
    process.env.STOREFRONT_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:8000"
  const imageUrl = new URL(BANNER_IMAGE_PATH, storefrontUrl).toString()
  const [existingBanners] = await promoBannerService.listAndCountPromoBanners(
    { title: BANNER_TITLE },
    { take: 1 }
  )

  if (existingBanners.length) {
    logger.info(`Promo banner "${BANNER_TITLE}" already exists.`)
    return
  }

  await promoBannerService.createPromoBanners({
    type: "promotion",
    title: BANNER_TITLE,
    subtitle: null,
    image_url: imageUrl,
    mobile_image_url: null,
    image_only: true,
    alt_text: "Promoção Black das Blacks da NuveX Games",
    link_url: "/br/store",
    cta_label: null,
    sort_order: 0,
    is_active: true,
    starts_at: null,
    ends_at: null,
  })

  logger.info(`Created active promo banner "${BANNER_TITLE}".`)
}
