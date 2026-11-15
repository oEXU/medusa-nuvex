import { MedusaService } from "@medusajs/framework/utils"
import PromoBanner from "./models/promo-banner"

class PromoBannerModuleService extends MedusaService({
  PromoBanner,
}) {}

export default PromoBannerModuleService
