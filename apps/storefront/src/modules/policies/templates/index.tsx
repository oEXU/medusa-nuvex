import { convertToLocale } from "@lib/util/money"
import { formatDayRange, StorePolicies } from "@lib/util/store-policies"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const formatShippingRate = (rate: number, currencyCode: string) =>
  rate === 0 ? "Free" : convertToLocale({ amount: rate, currency_code: currencyCode })

export const PolicyPage = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="content-container py-12 max-w-3xl" data-testid="policy-page">
    <h1 className="text-2xl-semi mb-8">{title}</h1>
    <div className="flex flex-col gap-6 text-base-regular text-ui-fg-base">
      {children}
    </div>
  </div>
)

export const PolicyHero = ({
  title,
  eyebrow,
  description,
  updated,
}: {
  title: string
  eyebrow: string
  description: string
  updated: string
}) => (
  <section className="relative overflow-hidden rounded-3xl bg-[#1a103a] px-6 py-9 text-white shadow-[0_18px_50px_rgba(26,16,58,0.16)] small:px-10 small:py-12">
    <div
      aria-hidden="true"
      className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-pink-400/20 blur-2xl"
    />
    <div
      aria-hidden="true"
      className="absolute bottom-[-120px] left-[45%] h-56 w-56 rounded-full bg-violet-500/20 blur-2xl"
    />
    <div className="relative max-w-3xl">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-pink-200">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
        >
          <path
            d="M7 3.5h7l4 4V20.5H7v-17Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M14 3.5v4h4M10 12h5M10 16h5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        {eyebrow}
      </div>
      <h1 className="text-3xl font-bold tracking-tight small:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 small:text-base">
        {description}
      </p>
      <p className="mt-6 text-xs text-white/60">{updated}</p>
    </div>
  </section>
)

export const PolicyNavigation = ({
  items,
  ariaLabel,
  title,
  baseHref,
}: {
  items: [string, string][]
  ariaLabel: string
  title: string
  baseHref: string
}) => (
  <nav
    aria-label={ariaLabel}
    className="h-fit rounded-2xl border border-[#e8e5ef] bg-[#faf9fc] p-3 medium:sticky medium:top-32"
  >
    <p className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#817a91]">
      {title}
    </p>
    <div className="flex flex-col">
      {items.map(([id, label]) => (
        <LocalizedClientLink
          key={id}
          href={`${baseHref}#${id}`}
          className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#4b4658] transition hover:bg-white hover:text-[#6d28d9]"
        >
          {label}
        </LocalizedClientLink>
      ))}
    </div>
  </nav>
)

export const PolicySection = ({
  id,
  number,
  title,
  children,
}: {
  id: string
  number: string
  title: string
  children: React.ReactNode
}) => (
  <section
    id={id}
    className="scroll-mt-36 rounded-2xl border border-[#e8e5ef] bg-white p-6 shadow-[0_8px_24px_rgba(26,16,58,0.05)] small:p-8"
  >
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3e8ff] text-xs font-black text-[#6d28d9]">
        {number}
      </span>
      <h2 className="text-xl font-bold tracking-tight text-[#1a103a]">
        {title}
      </h2>
    </div>
    <div className="flex flex-col gap-3 text-[15px] leading-7 text-[#625d70]">
      {children}
    </div>
  </section>
)

export const PolicyLink = ({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) => (
  <LocalizedClientLink
    href={href}
    className="font-semibold text-[#6d28d9] underline decoration-[#b99de7] underline-offset-4 transition hover:text-[#4c1d95]"
  >
    {children}
  </LocalizedClientLink>
)

export const PoliciesUnavailable = () => (
  <p className="text-ui-fg-subtle">
    Policy details for this region haven&apos;t been published yet.
  </p>
)

export const ShippingSummary = ({
  policies,
  currencyCode,
}: {
  policies: StorePolicies
  currencyCode: string
}) => (
  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
    <dt className="text-ui-fg-subtle">Shipping rate</dt>
    <dd>{formatShippingRate(policies.shippingRate, currencyCode)}</dd>
    <dt className="text-ui-fg-subtle">Processing time</dt>
    <dd>{formatDayRange(policies.handlingDays)} business days</dd>
    <dt className="text-ui-fg-subtle">Delivery time</dt>
    <dd>{formatDayRange(policies.transitDays)} business days after dispatch</dd>
  </dl>
)

export const PlaceholderNotice = () => (
  <p className="text-ui-fg-subtle" data-testid="policy-placeholder">
    This is placeholder content from the NuveX starter. Replace it with your
    store&apos;s own text before launch.
  </p>
)
