import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import { toJsonLd } from "@lib/util/product-structured-data"
import { getSiteOrigin, STORE_NAME } from "@lib/util/site"
import { buildRegionsReturnPolicies } from "@lib/util/store-policies"
import { translate } from "@lib/util/store-locale"
import ProductPreview from "@modules/products/components/product-preview"

export const dynamic = "force-static"
export const revalidate = 60

export async function generateMetadata(props: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await props.params
  const origin = await getSiteOrigin()
  const isEnglish = countryCode === "us"

  return {
    title: isEnglish
      ? "NuveX Games | Your next level starts here"
      : "NuveX Games | Sua próxima fase começa aqui",
    description: isEnglish
      ? "Discover NuveX Games and stay tuned for what's coming next."
      : "Um novo universo de games está sendo preparado para você. Conheça a NuveX Games.",
    alternates: {
      canonical: `${origin}/${countryCode}`,
      languages: {
        "pt-BR": `${origin}/br`,
        "en-US": `${origin}/us`,
        "x-default": `${origin}/br`,
      },
    },
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const [
    origin,
    regions,
    {
      response: { products },
    },
  ] = await Promise.all([
    getSiteOrigin(),
    listRegions(),
    listProducts({
      regionId: region.id,
      queryParams: {
        limit: 12,
        fields: "*variants.calculated_price,*variants.images",
      },
    }),
  ])
  const currencyPricedProducts = products.filter((product) =>
    product.variants?.some(
      (variant) =>
        variant.calculated_price?.currency_code === region.currency_code,
    ),
  )
  const homeUrl = `${origin}/${countryCode}`
  const returnPolicies = buildRegionsReturnPolicies(regions)
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: STORE_NAME,
      url: origin,
      ...(returnPolicies.length
        ? { hasMerchantReturnPolicy: returnPolicies }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: STORE_NAME,
      url: homeUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${homeUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(structuredData) }}
      />
      <Hero region={region} countryCode={countryCode} />
      <section
        id="catalogo"
        className="bg-[#080b12] px-6 pb-20 text-white small:pb-28"
      >
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-fuchsia-300/15 bg-[#100c20] px-6 py-12 small:px-12 small:py-14">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(217,70,239,0.12),transparent_58%)]"
          />
          <div className="relative">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-pink-300">
              {translate(countryCode, "catalog")}
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white small:text-4xl">
              {currencyPricedProducts.length
                ? translate(countryCode, "chooseAdventure")
                : translate(countryCode, "catalogPreparing")}
            </h2>
            {currencyPricedProducts.length ? (
              <ul className="mt-8 grid grid-cols-1 gap-5 xsmall:grid-cols-2 medium:grid-cols-4">
                {currencyPricedProducts.slice(0, 8).map((product) => (
                  <li
                    key={product.id}
                    className="overflow-hidden rounded-2xl bg-white p-3 text-slate-950"
                  >
                    <ProductPreview product={product} region={region} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5 flex flex-col gap-5 small:flex-row small:items-end small:justify-between">
                <p className="max-w-2xl text-sm leading-6 text-slate-300/75">
                  {translate(countryCode, "catalogDescription")}
                </p>
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-pink-200/15 bg-pink-200/[0.06] px-4 py-2 text-xs font-semibold text-pink-100/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-300" />
                  {translate(countryCode, "comingSoon")}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
