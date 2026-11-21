import React from "react"

import { ArrowUpRightMini } from "@medusajs/icons"
import { getStoreLanguage } from "@lib/util/store-locale"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  countryCode: string
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  countryCode,
  children,
}) => {
  const isBrazil = getStoreLanguage(countryCode) === "pt-BR"

  return (
    <div
      className="min-h-[65vh] flex-1 bg-gray-50 py-8 small:py-12"
      data-testid="account-page"
    >
      <div className="content-container mx-auto max-w-6xl">
        <div
          className={
            customer
              ? "grid grid-cols-1 gap-6 small:grid-cols-[240px_minmax(0,1fr)] small:gap-8"
              : "grid grid-cols-1 gap-6"
          }
        >
          {customer && (
            <aside className="min-w-0">
              <AccountNav customer={customer} />
            </aside>
          )}
          <main className="min-w-0">{children}</main>
        </div>
        <section className="relative mt-8 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/70 shadow-sm">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#25D366] to-[#128C7E]"
          />
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-emerald-100/50 blur-3xl"
          />
          <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#25D366] shadow-lg shadow-emerald-600/20">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 48 48"
                  className="h-9 w-9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M24 5.5a17.5 17.5 0 0 0-15 26.5l-2 9 9.2-2.1A17.5 17.5 0 1 0 24 5.5Z"
                    fill="white"
                  />
                  <path
                    d="M17.3 14.7c-.5 0-1 .2-1.4.6-1.3 1.2-2 2.7-2 4.5 0 2.8 1.9 5.7 2.2 6.1.3.4 3.8 6.1 9.4 8.3 4.6 1.8 5.6 1.4 6.6 1.3 1-.2 3.1-1.3 3.5-2.6.4-1.3.4-2.4.2-2.6-.2-.2-.5-.4-1.1-.7l-3.7-1.8c-.5-.2-.9-.4-1.3.2-.4.5-1.5 1.8-1.8 2.2-.3.4-.7.4-1.3.1a15.5 15.5 0 0 1-4.6-2.8 17.1 17.1 0 0 1-3.2-4c-.3-.6 0-.9.2-1.2.2-.2.6-.7.9-1 .3-.3.4-.5.6-.9.2-.3.1-.6 0-.9l-1.7-3.9c-.4-1-.8-1-1.3-1h-1.2Z"
                    fill="#25D366"
                  />
                </svg>
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  {isBrazil ? "Atendimento" : "Customer care"}
                </p>
                <h2 className="mt-1 text-base font-semibold text-gray-900">
                  {isBrazil ? "Precisa de ajuda?" : "Need a hand?"}
                </h2>
                <p className="mt-1 max-w-xl text-sm leading-6 text-gray-600">
                  {isBrazil
                    ? "Estamos aqui para ajudar com seus pedidos, conta ou qualquer dúvida."
                    : "We’re here to help with your orders, account, or any questions."}
                </p>
              </div>
            </div>
            <LocalizedClientLink
              href="/customer-service"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#1a103a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#281457] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              {isBrazil ? "Fale com o suporte" : "Contact support"}
              <ArrowUpRightMini />
            </LocalizedClientLink>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AccountLayout
