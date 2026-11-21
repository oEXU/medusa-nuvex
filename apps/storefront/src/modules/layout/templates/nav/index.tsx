import Image from "next/image"
import { Suspense } from "react"

import { getStoreLanguage, translate } from "@lib/util/store-locale"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import AnnouncementBanner from "@modules/layout/components/announcement-banner"
import LanguageSwitcher from "@modules/layout/components/language-switcher"
import NavCategories from "@modules/layout/components/nav-categories"
import Search from "@modules/layout/components/search"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav({
  countryCode,
  customer,
}: {
  countryCode: string
  customer: { first_name?: string | null; email?: string | null } | null
}) {
  const isBrazil = getStoreLanguage(countryCode) === "pt-BR"
  const announcements = [
    translate(countryCode, "announcementInstallments"),
    translate(countryCode, "announcementFlashDelivery"),
    translate(countryCode, "announcementDiscount"),
    translate(countryCode, "announcementPix"),
  ]

  return (
    <>
      <AnnouncementBanner
        label={translate(countryCode, "announcementLabel")}
        messages={announcements}
      />
      <div className="sticky inset-x-0 top-0 z-50">
        <header className="bg-[#1a103a] text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <div className="content-container mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 py-3 small:min-h-[88px] small:gap-8">
            <div className="flex shrink-0 items-center">
              <LocalizedClientLink
                href="/"
                className="flex items-center"
                aria-label="NuveX Games - inicio"
                data-testid="nav-store-link"
              >
                <Image
                  src="/nuve-x-logo.png"
                  alt="NuveX Games"
                  width={775}
                  height={574}
                  priority
                  className="h-[52px] w-auto object-contain small:h-[64px]"
                />
              </LocalizedClientLink>
            </div>

            <div className="hidden min-w-0 max-w-[610px] flex-1 small:block">
              <Search />
            </div>

            <div className="flex shrink-0 items-center gap-2 small:gap-7">
              <LanguageSwitcher />
              <LocalizedClientLink
                href="/account"
                className="flex items-center gap-2 transition hover:text-pink-200"
                aria-label={translate(countryCode, "myAccount")}
                data-testid="nav-account-link"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6 shrink-0"
                >
                  <circle
                    cx="12"
                    cy="7"
                    r="3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M4.5 20v-1.5a5 5 0 0 1 5-5h5a5 5 0 0 1 5 5V20h-15Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className="hidden text-xs font-semibold leading-4 xsmall:block"
                  data-testid={customer ? "nav-account-greeting" : undefined}
                >
                  {customer ? (
                    <>
                      {isBrazil ? "Olá" : "Hello"},{" "}
                      {customer.first_name?.trim() ||
                        customer.email ||
                        (isBrazil ? "cliente" : "customer")}
                    </>
                  ) : (
                    <>
                      {translate(countryCode, "login")}
                      <span className="block font-normal text-white/75">
                        {translate(countryCode, "register")}
                      </span>
                    </>
                  )}
                </span>
              </LocalizedClientLink>

              <Suspense
                fallback={
                  <LocalizedClientLink
                    className="text-sm font-semibold text-white/85 transition hover:text-pink-200"
                    href="/cart"
                    data-testid="nav-cart-link"
                  >
                    {translate(countryCode, "cart")}
                  </LocalizedClientLink>
                }
              >
                <div className="[&_a]:text-white [&_a]:transition [&_a]:hover:text-pink-200">
                  <CartButton />
                </div>
              </Suspense>
            </div>
          </div>

          <div className="content-container pb-3 small:hidden">
            <Search />
          </div>

          <nav
            aria-label="Navegação principal"
            className="border-b-[3px] border-pink-400 bg-[#1a103a] text-white"
          >
            <div className="content-container relative mx-auto flex h-[62px] max-w-7xl items-center gap-4">
              <div className="flex h-full shrink-0 items-center border-r border-white/15 pr-4">
                <SideMenu
                  countryCode={countryCode}
                />
              </div>
              <div className="flex h-full min-w-0 flex-1 items-center justify-start gap-6 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden small:justify-center medium:absolute medium:left-1/2 medium:w-max medium:-translate-x-1/2">
                <NavCategories countryCode={countryCode} />
              </div>
            </div>
          </nav>
        </header>
      </div>
    </>
  )
}
