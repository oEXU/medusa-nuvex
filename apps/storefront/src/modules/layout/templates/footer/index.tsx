import Image from "next/image"
import { translate, type TranslationKey } from "@lib/util/store-locale"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const informationLinks: { label: TranslationKey; href: string }[] = [
  { label: "contact", href: "/contact" },
  { label: "myAccount", href: "/account" },
]

const policyLinks: { label: TranslationKey; href: string }[] = [
  { label: "privacy", href: "/privacy" },
  { label: "terms", href: "/terms" },
  { label: "returns", href: "/returns" },
  { label: "shipping", href: "/shipping" },
]

const socialLinks = [
  {
    label: "Instagram",
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    icon: "instagram",
  },
  { label: "TikTok", href: process.env.NEXT_PUBLIC_TIKTOK_URL, icon: "tiktok" },
  {
    label: "YouTube",
    href: process.env.NEXT_PUBLIC_YOUTUBE_URL,
    icon: "youtube",
  },
].filter((link): link is typeof link & { href: string } => Boolean(link.href))

function SocialIcon({ name }: { name: string }) {
  if (name === "instagram") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.5" cy="6.8" r="1" fill="currentColor" />
      </svg>
    )
  }

  if (name === "tiktok") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <path d="M19.6 8.3a7.1 7.1 0 0 1-4.3-1.5v8.1a5.8 5.8 0 1 1-5-5.7v3.2a2.7 2.7 0 1 0 1.8 2.5V2.5h3.2c.2 2 1.7 3.6 4.3 3.9v1.9Z" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  )
}

export default function Footer({ countryCode }: { countryCode: string }) {
  return (
    <footer className="border-t border-white/10 bg-[#070a10] text-white">
      <div className="content-container max-w-7xl">
        <div className="grid gap-8 border-b border-white/10 py-9 small:grid-cols-[1fr_auto] small:items-center small:py-11">
          <div className="flex flex-col gap-6 medium:flex-row medium:items-start medium:gap-8">
            <LocalizedClientLink href="/" aria-label="NuveX Games - início" className="shrink-0">
              <Image
                src="/nuve-x-logo.png"
                alt="NuveX Games"
                width={775}
                height={574}
                className="h-14 w-auto object-contain"
              />
            </LocalizedClientLink>
            <div className="flex flex-col gap-3">
              <p className="max-w-md text-sm leading-6 text-slate-300">
                {translate(countryCode, "footerDescription")}
              </p>

              {/* Dados institucionais e fiscais da empresa */}
              <div className="border-l-2 border-pink-400/80 pl-3.5 text-xs leading-relaxed text-slate-400">
                <p className="font-semibold text-slate-200">
                  {translate(countryCode, "companyBelongsTo")}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2">
                  <span className="font-medium text-slate-300">
                    {translate(countryCode, "companyTaxId")}
                  </span>
                  <span className="hidden text-white/20 xsmall:inline">·</span>
                  <span>
                    {translate(countryCode, "companyPhoneLabel")}:{" "}
                    <a
                      href="https://wa.me/5511947962725"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-pink-300 transition hover:text-pink-200 hover:underline"
                    >
                      (11) 94796-2725
                    </a>
                  </span>
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {translate(countryCode, "companyAddress")}
                </p>
              </div>

              {socialLinks.length > 0 && (
                <nav
                  aria-label={
                    countryCode === "us" ? "Social media" : "Redes sociais"
                  }
                  className="mt-1 flex items-center gap-2"
                >
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.label}
                      className="flex h-9 w-9 items-center justify-center rounded border border-white/15 text-slate-300 transition hover:border-pink-300 hover:text-pink-200"
                    >
                      <SocialIcon name={social.icon} />
                    </a>
                  ))}
                </nav>
              )}
            </div>
          </div>

          <div className="border-l-2 border-pink-400/70 pl-4 small:max-w-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              {translate(countryCode, "nextPhaseComing")}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {translate(countryCode, "contactHelp")}
            </p>
            <LocalizedClientLink
              href="/contact"
              className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-pink-200 transition hover:text-white"
            >
              {translate(countryCode, "contactUs")}{" "}
              <span aria-hidden="true">→</span>
            </LocalizedClientLink>
          </div>
        </div>

        <div className="grid gap-8 border-b border-white/10 bg-white px-5 py-7 text-slate-900 small:grid-cols-3 small:items-center small:gap-7 small:px-8">
          <section aria-label={translate(countryCode, "paymentMethods")}>
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700">
              {translate(countryCode, "paymentMethods")}
            </h2>
            <Image
              src="/footer-payment-methods.png"
              alt="American Express, Hipercard, Mastercard, Visa, Elo e boleto"
              width={473}
              height={59}
              className="mt-4 h-auto w-full max-w-[390px] object-contain object-left"
            />
          </section>

          <section aria-label={translate(countryCode, "secureShopping")}>
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700">
              {translate(countryCode, "secureShopping")}
            </h2>
            <Image
              src="/footer-security.png"
              alt="Site seguro SSL e Google Safe Browsing"
              width={260}
              height={67}
              className="mt-4 h-auto w-full max-w-[230px] object-contain object-left"
            />
          </section>

          <section aria-label={translate(countryCode, "certifications")}>
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700">
              {translate(countryCode, "certifications")}
            </h2>
            <Image
              src="/footer-certifications.png"
              alt="ISO 9001, energia solar e Reclame Aqui"
              width={405}
              height={159}
              className="mt-2 h-auto w-full max-w-[300px] object-contain object-left"
            />
          </section>
        </div>

        <p className="border-b border-white/10 py-3 text-[10px] leading-4 text-slate-500">
          {translate(countryCode, "paymentNotice")}
        </p>

        <div className="grid gap-8 border-b border-white/10 py-8 small:grid-cols-2 small:gap-6 small:py-9">
          <nav aria-label={translate(countryCode, "customerService")}>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              {translate(countryCode, "customerService")}
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              {informationLinks.map((link) => (
                <li key={link.href}>
                  <LocalizedClientLink
                    href={link.href}
                    className="transition hover:text-pink-200"
                  >
                    {translate(countryCode, link.label)}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={translate(countryCode, "information")}>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              {translate(countryCode, "information")}
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-400">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <LocalizedClientLink
                    href={link.href}
                    className="transition hover:text-pink-200"
                  >
                    {translate(countryCode, link.label)}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-2 py-5 text-xs text-slate-500 xsmall:flex-row xsmall:items-center xsmall:justify-between">
          <p>
            © {new Date().getFullYear()} NuveX Games · TAURUS GAMES & ELETRÔNICOS.{" "}
            {translate(countryCode, "copyright")}
          </p>
          <p>{translate(countryCode, "madeForGamersFooter")}</p>
        </div>
      </div>
    </footer>
  )
}
