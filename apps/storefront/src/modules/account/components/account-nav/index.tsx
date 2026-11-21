"use client"

import { ArrowRightOnRectangle } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useParams, usePathname } from "next/navigation"

import { signout } from "@lib/data/customer"
import { getStoreLanguage } from "@lib/util/store-locale"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"
import User from "@modules/common/icons/user"

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }
  const isBrazil = getStoreLanguage(countryCode) === "pt-BR"
  const sectionName = isBrazil ? "Minha conta" : "My account"

  const handleLogout = async () => {
    await signout(countryCode)
  }

  return (
    <div>
      <div className="small:hidden" data-testid="mobile-account-nav">
        {route !== `/${countryCode}/account` ? (
          <LocalizedClientLink
            href="/account"
            className="flex items-center gap-x-2 text-small-regular py-2"
            data-testid="account-main-link"
          >
            <>
              <ChevronDown className="transform rotate-90" />
              <span>{sectionName}</span>
            </>
          </LocalizedClientLink>
        ) : (
          <>
            <div className="mb-4 px-1 text-lg font-semibold text-gray-900">
              {isBrazil ? "Olá" : "Hello"} {customer?.first_name}
            </div>
            <div className="text-base-regular">
              <ul className="space-y-2">
                <li>
                  <LocalizedClientLink
                    href="/account/profile"
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700"
                    data-testid="profile-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <User size={20} />
                        <span>{isBrazil ? "Perfil" : "Profile"}</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/addresses"
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700"
                    data-testid="addresses-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <MapPin size={20} />
                        <span>{isBrazil ? "Endereços" : "Addresses"}</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/orders"
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700"
                    data-testid="orders-link"
                  >
                    <div className="flex items-center gap-x-2">
                      <Package size={20} />
                      <span>{isBrazil ? "Pedidos" : "Orders"}</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-600"
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    <div className="flex items-center gap-x-2">
                      <ArrowRightOnRectangle />
                      <span>{isBrazil ? "Sair" : "Log out"}</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
      <div className="hidden small:block" data-testid="account-nav">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-50 text-sm font-bold uppercase text-fuchsia-700">
              {customer?.first_name?.charAt(0) || customer?.email?.charAt(0)}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900">
                {sectionName}
              </h3>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {customer?.first_name}
              </p>
            </div>
          </div>
          <div className="text-base-regular">
            <ul className="flex flex-col gap-1">
              <li>
                <AccountNavLink
                  href="/account"
                  route={route!}
                  data-testid="overview-link"
                  icon={<Package size={18} />}
                >
                  {isBrazil ? "Visão geral" : "Overview"}
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/profile"
                  route={route!}
                  data-testid="profile-link"
                  icon={<User size={18} />}
                >
                  {isBrazil ? "Perfil" : "Profile"}
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/addresses"
                  route={route!}
                  data-testid="addresses-link"
                  icon={<MapPin size={18} />}
                >
                  {isBrazil ? "Endereços" : "Addresses"}
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/orders"
                  route={route!}
                  data-testid="orders-link"
                  icon={<Package size={18} />}
                >
                  {isBrazil ? "Pedidos" : "Orders"}
                </AccountNavLink>
              </li>
              <li className="mt-3 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                  onClick={handleLogout}
                  data-testid="logout-button"
                >
                  <ArrowRightOnRectangle />
                  {isBrazil ? "Sair da conta" : "Sign out"}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  icon?: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  icon,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()

  const localizedPath = route.split(`/${countryCode}`)[1] || "/"
  const active =
    href === "/account"
      ? localizedPath === href
      : localizedPath === href || localizedPath.startsWith(`${href}/`)
  return (
    <LocalizedClientLink
      href={href}
      className={clx(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
        active
          ? "bg-fuchsia-50 font-semibold text-fuchsia-800"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
      data-testid={dataTestId}
    >
      <span className={active ? "text-fuchsia-700" : "text-gray-400"}>
        {icon}
      </span>
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav
