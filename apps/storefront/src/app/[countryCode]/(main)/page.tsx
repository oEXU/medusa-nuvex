import { Metadata } from "next"
import Image from "next/image"

import Hero from "@modules/home/components/hero"
import Faq from "@modules/home/components/faq"
import { getRegion, listRegions } from "@lib/data/regions"
import { toJsonLd } from "@lib/util/product-structured-data"
import { getSiteOrigin, STORE_NAME } from "@lib/util/site"
import { buildRegionsReturnPolicies } from "@lib/util/store-policies"

const testimonials = [
  {
    name: "Mc Wago",
    image: "/reviews/mc-wago.webp",
    quote: "Muito bom o atendimento, entrega tudo certinho! Recomendo demais!",
  },
  {
    name: "Victor Gabriel",
    image: "/reviews/victor-gabriel.webp",
    quote: "Super recomendado, rapaziada! Vale muito a pena.",
  },
  {
    name: "Matheus Lopes",
    image: "/reviews/matheus-lopes.webp",
    quote: "Recomendo! Atendimento rápido e loja totalmente confiável.",
  },
  {
    name: "Valmir Major",
    image: "/reviews/valmir-major.webp",
    quote:
      "Muito confiável! Tive uma pequena dúvida para instalar o jogo, mas pedi ajuda ao suporte no WhatsApp. Obtive atendimento na mesma hora e consegui ativar. Recomendo muito!",
  },
  {
    name: "Rickley Richard",
    image: "/reviews/rickley-richard.webp",
    quote:
      "Comprei e realmente funciona perfeitamente. A loja oferece um excelente atendimento ao cliente, assinei a PSN Extra de 12 meses e os preços são muito acessíveis.",
  },
  {
    name: "Edson Holanda",
    image: "/reviews/edson-holanda.webp",
    quote:
      "Excelente serviço e atendimento ágil! Jogos originais, de qualidade e com ótimo preço.",
  },
]

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof testimonials)[number]
}) {
  return (
    <li className="relative flex min-h-[320px] w-[320px] max-w-[82vw] shrink-0 flex-col items-center rounded-2xl border border-fuchsia-300/25 bg-gradient-to-br from-[#1c1430] via-[#120d22] to-[#0d0a18] px-6 pb-7 text-center shadow-[0_12px_40px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-pink-300/60 hover:shadow-[0_18px_48px_rgba(217,70,239,0.16)] small:w-[360px]">
      <span
        aria-hidden="true"
        className="absolute right-5 top-3 text-5xl leading-none text-pink-300/20"
      >
        “
      </span>
      <div className="-mt-12 rounded-full bg-gradient-to-br from-pink-300 to-fuchsia-500 p-1 shadow-[0_0_24px_rgba(217,70,239,0.35)]">
        <Image
          src={testimonial.image}
          alt=""
          width={88}
          height={88}
          className="h-[88px] w-[88px] rounded-full border-4 border-[#151027] object-cover"
        />
      </div>
      <h3 className="mt-3 text-base font-bold text-white">{testimonial.name}</h3>
      <p
        aria-label="5 de 5 estrelas"
        role="img"
        className="mt-2 rounded-full border border-amber-300/15 bg-amber-300/[0.08] px-3 py-1 text-lg leading-5 tracking-[0.1em] text-amber-300"
      >
        ★★★★★
      </p>
      <blockquote className="mt-4 text-sm leading-6 text-slate-200">
        {testimonial.quote}
      </blockquote>
    </li>
  )
}

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

  const [origin, regions] = await Promise.all([getSiteOrigin(), listRegions()])
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
        id="depoimentos"
        className="bg-[#080b12] px-6 py-16 text-white small:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold tracking-tight small:text-3xl">
            Depoimentos
          </h2>
          <div
            aria-hidden="true"
            className="mx-auto mt-4 h-0.5 w-10 bg-pink-300"
          />
          <p className="mt-6 text-center text-sm text-slate-300">
            Quem já confiou, recomenda
          </p>
          <div className="testimonial-marquee no-scrollbar mt-20 overflow-hidden pt-12">
            <div className="testimonial-marquee-track flex w-max">
              <ul
                aria-label="Depoimentos de clientes"
                className="flex shrink-0 gap-5 pr-5"
              >
                {testimonials.map((testimonial) => (
                  <TestimonialCard
                    key={testimonial.name}
                    testimonial={testimonial}
                  />
                ))}
              </ul>
              <ul aria-hidden="true" className="flex shrink-0 gap-5 pr-5">
                {testimonials.map((testimonial) => (
                  <TestimonialCard
                    key={testimonial.name}
                    testimonial={testimonial}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <Faq countryCode={countryCode} />
    </>
  )
}
