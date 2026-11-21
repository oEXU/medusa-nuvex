import type { CreatePromotionDTO, ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { createPromotionsWorkflow } from "@medusajs/medusa/core-flows"
import { PROMO_BANNER_MODULE } from "../modules/promo-banner"
import type PromoBannerModuleService from "../modules/promo-banner/service"

const BANNER_TITLE = "Cupom CASATECH10: 10% OFF em ar-condicionado"
const BANNER_IMAGE_PATH = "/banner-casatecha.png"
const BANNER_LINK_URL =
  "/br/products/ar-condicionado-portatil-kabum-smart-700-ksac700br127"
const GTA_VI_HANDLES = [
  "grand-theft-auto-vi-ultimate-edition-primaria",
  "grand-theft-auto-vi-ultimate-edition-secundaria",
]

export default async function seedStorePromotions({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const [{ data: promotions }, { data: gtaProducts }] = await Promise.all([
    query.graph({
      entity: "promotion",
      fields: ["id", "code"],
      filters: { code: ["VEMGTA", "CASATECH10"] },
    }),
    query.graph({
      entity: "product",
      fields: ["id", "handle"],
      filters: { handle: GTA_VI_HANDLES },
    }),
  ])

  const existingCodes = new Set(
    promotions
      .map((promotion) => promotion.code)
      .filter((code): code is string => Boolean(code))
  )
  const promotionsToCreate: CreatePromotionDTO[] = []

  if (!existingCodes.has("VEMGTA")) {
    const gtaProductIds = gtaProducts
      .map((product) => product.id)
      .filter((id): id is string => Boolean(id))

    if (gtaProductIds.length !== GTA_VI_HANDLES.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Seed the GTA VI products before creating the VEMGTA promotion."
      )
    }

    promotionsToCreate.push({
      code: "VEMGTA",
      type: "standard",
      status: "active",
      is_automatic: false,
      application_method: {
        type: "fixed",
        target_type: "items",
        allocation: "across",
        value: 50,
        currency_code: "brl",
        target_rules: [
          {
            attribute: "product_id",
            operator: "in",
            values: gtaProductIds,
          },
        ],
      },
    })
  }

  if (!existingCodes.has("CASATECH10")) {
    promotionsToCreate.push({
      code: "CASATECH10",
      type: "standard",
      status: "active",
      is_automatic: false,
      application_method: {
        type: "percentage",
        target_type: "items",
        allocation: "across",
        value: 10,
      },
    })
  }

  if (promotionsToCreate.length) {
    await createPromotionsWorkflow(container).run({
      input: { promotionsData: promotionsToCreate },
    })
    logger.info(
      `Created promotion(s): ${promotionsToCreate.map(({ code }) => code).join(", ")}.`
    )
  } else {
    logger.info("Promotions VEMGTA and CASATECH10 already exist.")
  }

  const promoBannerService =
    container.resolve<PromoBannerModuleService>(PROMO_BANNER_MODULE)
  const [existingBanners] =
    await promoBannerService.listAndCountPromoBanners(
      { title: BANNER_TITLE },
      { take: 1 }
    )

  const storefrontUrl =
    process.env.STOREFRONT_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:8000"
  const bannerImageUrl = new URL(BANNER_IMAGE_PATH, storefrontUrl).toString()

  if (existingBanners.length) {
    if (
      existingBanners[0].image_url !== bannerImageUrl ||
      existingBanners[0].link_url !== BANNER_LINK_URL
    ) {
      await promoBannerService.updatePromoBanners({
        id: existingBanners[0].id,
        image_url: bannerImageUrl,
        link_url: BANNER_LINK_URL,
      })
      logger.info(`Updated image and link for promo banner "${BANNER_TITLE}".`)
    } else {
      logger.info(`Promo banner "${BANNER_TITLE}" already exists.`)
    }

    return
  }

  await promoBannerService.createPromoBanners({
    type: "promotion",
    title: BANNER_TITLE,
    subtitle: null,
    image_url: bannerImageUrl,
    mobile_image_url: null,
    image_only: true,
    alt_text:
      "Ar-condicionado a partir de R$ 1.799,99 com cupom CASATECH10, 10% OFF e frete grátis no Sul e Sudeste",
    link_url: BANNER_LINK_URL,
    cta_label: null,
    sort_order: 1,
    is_active: true,
    starts_at: null,
    ends_at: null,
  })

  logger.info(`Created active promo banner "${BANNER_TITLE}".`)
}
