import { model } from "@medusajs/framework/utils"

const PromoBanner = model.define("promo_banner", {
  id: model.id().primaryKey(),
  type: model.text().default("promotion"),
  title: model.text(),
  subtitle: model.text().nullable(),
  image_url: model.text(),
  mobile_image_url: model.text().nullable(),
  alt_text: model.text(),
  link_url: model.text().nullable(),
  cta_label: model.text().nullable(),
  sort_order: model.number().default(0),
  is_active: model.boolean().default(true),
  starts_at: model.dateTime().nullable(),
  ends_at: model.dateTime().nullable(),
})

export default PromoBanner
