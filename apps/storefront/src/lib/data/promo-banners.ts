import { sdk } from "@lib/config"

export type PromoBanner = {
  id: string
  type: "promotion" | "weekly_drop" | "launch" | "news" | "announcement"
  title: string
  subtitle: string | null
  image_url: string
  mobile_image_url: string | null
  alt_text: string
  link_url: string | null
  cta_label: string | null
  sort_order: number
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
}

export async function listPromoBanners() {
  const { promo_banners } = await sdk.client.fetch<{
    promo_banners: PromoBanner[]
  }>("/store/promo-banners")

  return promo_banners
}
