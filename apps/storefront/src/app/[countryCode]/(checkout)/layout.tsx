import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import TrustSeals from "@modules/checkout/components/trust-seals"
import BlackcatOriginScript from "@modules/checkout/components/blackcat-origin-script"
import { translate } from "@lib/util/store-locale"
import { getBlackcatOriginScriptUrl } from "@lib/data/payment"
import Image from "next/image"

export default async function CheckoutLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const blackcatOriginScriptUrl = await getBlackcatOriginScriptUrl().catch(
    () => undefined
  )
  return (
    <div className="relative min-h-screen w-full bg-slate-50">
      <BlackcatOriginScript src={blackcatOriginScriptUrl} />
      <div className="h-16 border-b border-slate-200 bg-white">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-ui-fg-base flex items-center gap-x-2 uppercase flex-1 basis-0"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="mt-px hidden small:block txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base ">
              {translate(countryCode, "backToCart")}
            </span>
            <span className="mt-px block small:hidden txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base">
              {translate(countryCode, "back")}
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="flex h-12 items-center px-1"
            data-testid="store-link"
          >
            <Image
              src="/nuve-x-logo.png"
              alt="NuveX Games"
              width={54}
              height={40}
              className="h-10 w-auto object-contain brightness-0"
            />
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">
        <div className="content-container pb-0 pt-6 small:pt-8">
          <Image
            src="/checkout-gta-vi-banner.gif"
            alt="Semana do GTA VI: R$ 50 OFF para garantir o jogo com o cupom VEMGTA"
            width={2870}
            height={678}
            unoptimized
            priority
            sizes="(min-width: 1280px) 1216px, calc(100vw - 2rem)"
            className="h-auto w-full rounded-lg"
          />
        </div>
        {children}
        <TrustSeals />
      </div>
    </div>
  )
}
