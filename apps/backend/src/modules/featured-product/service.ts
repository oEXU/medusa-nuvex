import { MedusaService } from "@medusajs/framework/utils"
import FeaturedProduct from "./models/featured-product"

class FeaturedProductModuleService extends MedusaService({
  FeaturedProduct,
}) {}

export default FeaturedProductModuleService
