import { Module } from "@medusajs/framework/utils"
import FeaturedProductModuleService from "./service"

export const FEATURED_PRODUCT_MODULE = "featuredProduct"

export default Module(FEATURED_PRODUCT_MODULE, {
  service: FeaturedProductModuleService,
})
