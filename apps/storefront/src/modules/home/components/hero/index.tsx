import Image from "next/image"
import { listFeaturedProductPlacements } from "@lib/data/featured-products"
import { listProducts } from "@lib/data/products"
import type { HttpTypes } from "@medusajs/types"
import CategoryProductGrid from "@modules/home/components/category-product-grid"
import RotatingHeadline from "@modules/home/components/hero/rotating-headline"
import { listPromoBanners } from "@lib/data/promo-banners"
import PromoBannerCarousel from "@modules/layout/components/promo-banner-carousel"
import {
  storeCategories,
  StoreCategoryIcon,
} from "@modules/layout/components/store-categories"
import {
  getCategoryDescription,
  getCategoryLabel,
  translate,
} from "@lib/util/store-locale"

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        d="M4.167 10h11.666m0 0-5-5m5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ZapIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

function TrophyIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

export default async function Hero({
  region,
  countryCode,
}: {
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  const [promoBanners, placements] = await Promise.all([
    listPromoBanners(),
    listFeaturedProductPlacements(),
  ])
  const productIds = Array.from(
    new Set(placements.map(({ product_id }) => product_id)),
  )
  const {
    response: { products },
  } = productIds.length
    ? await listProducts({
        regionId: region.id,
        queryParams: { id: productIds, limit: productIds.length },
      })
    : { response: { products: [] as HttpTypes.StoreProduct[] } }
  const productsById = new Map(products.map((product) => [product.id, product]))
  const gtaViOrder: Record<string, number> = {
    "grand-theft-auto-vi-ultimate-edition-primaria": 0,
    "grand-theft-auto-vi-ultimate-edition-secundaria": 1,
  }
  const productsByCategory = new Map(
    storeCategories.map((category) => {
      const categoryProductIds = placements
        .filter((placement) => placement.category_key === category.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((placement) => placement.product_id)

      const categoryProducts = categoryProductIds
        .map((productId) => productsById.get(productId))
        .filter((product): product is HttpTypes.StoreProduct =>
          Boolean(product),
        )

      categoryProducts.sort((first, second) => {
        const firstOrder = first.handle ? gtaViOrder[first.handle] : undefined
        const secondOrder = second.handle ? gtaViOrder[second.handle] : undefined

        if (firstOrder !== undefined || secondOrder !== undefined) {
          if (firstOrder === undefined) return 1
          if (secondOrder === undefined) return -1
          return firstOrder - secondOrder
        }

        return 0
      })

      return [
        category.id,
        categoryProducts,
      ]
    }),
  )

  return (
    <div className="overflow-hidden bg-[#080b12] text-white">
      <section className="relative isolate">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -right-52 -top-56 h-[38rem] w-[38rem] rounded-full bg-fuchsia-500/15 blur-[120px]" />
          <div className="absolute -bottom-72 left-[-10rem] h-[36rem] w-[36rem] rounded-full bg-violet-600/15 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_46%,rgba(190,24,93,0.14),transparent_42%),radial-gradient(ellipse_at_94%_52%,rgba(34,211,238,0.12),transparent_38%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
        </div>

        <div className="content-container grid min-h-[600px] max-w-7xl items-center gap-8 pb-16 pt-12 small:grid-cols-[1.05fr_0.95fr] small:pb-20 small:pt-16">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-pink-300/20 bg-pink-300/[0.07] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-pink-200">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-300 shadow-[0_0_12px_2px_rgba(249,168,212,0.55)]" />
              {translate(countryCode, "nuveXBrazil")}
            </div>

            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/45">
              {translate(countryCode, "nextLevel")}
            </p>
            <RotatingHeadline countryCode={countryCode} />
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300/75 small:text-lg">
              {translate(countryCode, "heroDescription")}
            </p>

            <div className="mt-9 flex flex-col gap-3 xsmall:flex-row">
              <a
                href="#plataformas"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-pink-700 px-6 text-sm font-bold text-white shadow-[0_10px_40px_rgba(190,24,93,0.2)] transition hover:-translate-y-0.5 hover:bg-pink-600"
              >
                {translate(countryCode, "explorePlatforms")} <ArrowIcon />
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/10 pt-5 text-xs font-medium text-slate-400">
              <span className="inline-flex items-center gap-2">
                <span className="text-pink-300">01</span>{" "}
                {translate(countryCode, "madeForGamers")}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="text-pink-300">02</span>{" "}
                {translate(countryCode, "brazilFocus")}
              </span>
            </div>
          </div>

          <div className="relative mx-auto flex aspect-square w-full max-w-[500px] items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute inset-[3%] rounded-full bg-[conic-gradient(from_210deg,#ec4899,#8b5cf6_42%,#22d3ee_76%,#ec4899)] opacity-90 blur-[1px]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-[5%] rounded-full border border-white/15 shadow-[0_0_48px_rgba(217,70,239,0.12),0_0_70px_rgba(34,211,238,0.08)]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-[11%] rounded-full border border-dashed border-white/15"
            />
            <div
              aria-hidden="true"
              className="absolute inset-[20%] rounded-full bg-fuchsia-500/20 blur-3xl"
            />
            <div className="nuvex-logo-float relative z-10 flex h-[78%] w-[78%] items-center justify-center rounded-full border border-white/25 bg-[radial-gradient(circle_at_32%_24%,rgba(168,85,247,0.28),transparent_43%),linear-gradient(145deg,#1a0b35_0%,#0b0a1a_66%,#07111d_100%)] p-8 shadow-[0_0_70px_rgba(217,70,239,0.2),0_35px_110px_rgba(0,0,0,0.65)] before:absolute before:inset-2 before:rounded-full before:border before:border-white/10 before:content-['']">
              <Image
                src="/nuve-x-logo.png"
                alt="NuveX Games"
                width={775}
                height={574}
                priority
                loading="eager"
                className="relative h-auto w-[86%] drop-shadow-[0_0_32px_rgba(217,70,239,0.24)]"
              />
            </div>
            {/* HUD Gamer 1 - XP & Level Up (Topo / Esquerda) */}
            <div className="hud-float-1 absolute -left-2 top-4 z-30 hidden rounded-2xl border border-fuchsia-400/40 bg-[#0e0a24]/90 p-3 shadow-[0_16px_36px_rgba(0,0,0,0.85),0_0_24px_rgba(217,70,239,0.25)] ring-1 ring-white/10 backdrop-blur-xl xsmall:flex xsmall:flex-col xsmall:gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-pink-500/40 bg-pink-500/20 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.5)]">
                  <ZapIcon className="h-4 w-4" />
                </span>
                <span className="rounded bg-gradient-to-r from-pink-500 to-purple-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-[0_0_10px_rgba(236,72,153,0.6)]">
                  {translate(countryCode, "playerLevel")}
                </span>
                <span className="font-mono text-[10px] font-bold text-fuchsia-300">
                  {translate(countryCode, "xpBoost")}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  <span>XP Boost</span>
                  <span className="font-mono text-pink-300">85%</span>
                </div>
                <div className="h-1.5 w-36 overflow-hidden rounded-full bg-white/10 p-0.5">
                  <div className="h-full w-[85%] animate-pulse rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-400 to-cyan-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
                </div>
              </div>
            </div>

            {/* HUD Gamer 2 - Conquista & Drop Raro (Base / Direita) */}
            <div className="hud-float-2 absolute -right-2 bottom-4 z-30 flex items-center gap-3 rounded-2xl border border-cyan-400/40 bg-[#070e24]/90 p-3 shadow-[0_16px_36px_rgba(0,0,0,0.85),0_0_24px_rgba(34,211,238,0.2)] ring-1 ring-white/10 backdrop-blur-xl xsmall:-right-6 xsmall:bottom-8">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-400/15 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.4)]">
                <TrophyIcon className="h-5 w-5" />
              </span>
              <div>
                <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                  {translate(countryCode, "achievementUnlocked")}
                </span>
                <span className="mt-0.5 block text-xs font-bold tracking-wide text-white">
                  {translate(countryCode, "rareDrop")}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
                  {translate(countryCode, "lowLatency")}
                </span>
              </div>
            </div>

            {/* HUD Gamer 3 - Status Pill (Topo / Direita) */}
            <div className="absolute -top-3 right-4 z-30 hidden items-center gap-2 rounded-full border border-pink-400/30 bg-[#160c30]/90 px-3 py-1 shadow-lg backdrop-blur-md xsmall:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="font-mono text-[10px] font-bold text-pink-200">
                120 FPS · 4K HDR
              </span>
            </div>
            <span className="absolute right-[15%] top-[12%] h-2 w-2 rounded-full bg-orange-300 shadow-[0_0_18px_4px_rgba(253,186,116,0.4)]" />
            <span className="absolute bottom-[18%] left-[18%] h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_16px_4px_rgba(196,181,253,0.45)]" />
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.07] bg-white/[0.02]">
        <div className="content-container grid max-w-7xl gap-5 py-6 small:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-[0.16em] text-pink-300">
              NX / 01
            </span>
            <span className="text-sm text-slate-300">
              {translate(countryCode, "storePromise")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-[0.16em] text-pink-300">
              NX / 02
            </span>
            <span className="text-sm text-slate-300">
              {translate(countryCode, "trustStatement")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-[0.16em] text-pink-300">
              NX / 03
            </span>
            <span className="text-sm text-slate-300">
              {translate(countryCode, "experienceInProgress")}
            </span>
          </div>
        </div>
      </section>

      <PromoBannerCarousel banners={promoBanners} />

      <section
        id="plataformas"
        className="content-container max-w-7xl py-20 small:py-28"
      >
        <div className="mb-10 flex flex-col justify-between gap-4 small:flex-row small:items-end">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-pink-300">
              {translate(countryCode, "platformEyebrow")}
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white small:text-4xl">
              {translate(countryCode, "platformHeading")}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-400">
            {translate(countryCode, "platformDescription")}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {storeCategories.map((category) => (
            <section
              key={category.id}
              id={category.id}
              className="scroll-mt-44 border-y border-r border-white/10 border-l-2 border-l-pink-400/80 bg-[linear-gradient(110deg,rgba(217,70,239,0.07),rgba(255,255,255,0.018)_32%,transparent_80%)] px-4 py-5 small:px-6 small:py-6"
            >
              <div className="mb-5 flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="flex h-12 w-14 shrink-0 items-center justify-center border border-fuchsia-300/20 bg-[#0b111c] text-white">
                  <StoreCategoryIcon
                    name={category.icon}
                    className="h-8 w-10"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold tracking-tight text-white small:text-2xl">
                    {getCategoryLabel(countryCode, category.id)}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 small:text-sm">
                    {getCategoryDescription(countryCode, category.id)}
                  </p>
                </div>
              </div>
              {productsByCategory.get(category.id)?.length ? (
                <CategoryProductGrid
                  products={productsByCategory.get(category.id) ?? []}
                  categoryId={category.id}
                  countryCode={countryCode}
                />
              ) : (
                <div className="flex min-h-14 items-center gap-3 py-2">
                  <span aria-hidden="true" className="h-5 w-1 bg-pink-400/70" />
                  <p className="text-sm text-slate-400">
                    {translate(countryCode, "platformEmptyBefore")}{" "}
                    <span className="font-medium text-slate-200">
                      {getCategoryLabel(countryCode, category.id)}
                    </span>
                    {translate(countryCode, "platformEmptyAfter")}
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>
      </section>
    </div>
  )
}
