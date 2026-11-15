import { Module } from "@medusajs/framework/utils"
import PromoBannerModuleService from "./service"

export const PROMO_BANNER_MODULE = "promoBanner"

export default Module(PROMO_BANNER_MODULE, {
  service: PromoBannerModuleService,
})
