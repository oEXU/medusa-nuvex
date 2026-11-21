import { ArrowRightMini } from "@medusajs/icons"
import { convertToLocale } from "@lib/util/money"
import { getStoreLanguage } from "@lib/util/store-locale"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"
import User from "@modules/common/icons/user"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
  countryCode: string
}

const Overview = ({ customer, orders, countryCode }: OverviewProps) => {
  const isBrazil = getStoreLanguage(countryCode) === "pt-BR"
  const profileCompletion = getProfileCompletion(customer)
  const addressCount = customer?.addresses?.length || 0

  return (
    <div className="space-y-6" data-testid="overview-page-wrapper">
      <section className="relative isolate overflow-hidden rounded-2xl bg-[#151321] px-6 py-7 text-white sm:px-8 sm:py-9">
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-24 -z-10 h-64 w-64 rounded-full bg-fuchsia-600/25 blur-3xl"
        />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
              {isBrazil ? "Central do jogador" : "Player dashboard"}
            </p>
            <h1
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
              data-testid="welcome-message"
              data-value={customer?.first_name}
            >
              {isBrazil ? "Olá" : "Hello"},{" "}
              {customer?.first_name || (isBrazil ? "jogador" : "gamer")}!
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
              {isBrazil
                ? "Acompanhe seus pedidos e mantenha seus dados sempre atualizados."
                : "Track your orders and keep your account details up to date."}
            </p>
          </div>
          <div className="border-t border-white/15 pt-4 text-left sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 sm:text-right">
            <p className="text-xs text-white/60">
              {isBrazil ? "Conectado como" : "Signed in as"}
            </p>
            <p
              className="mt-1 break-all text-sm font-medium"
              data-testid="customer-email"
              data-value={customer?.email}
            >
              {customer?.email}
            </p>
          </div>
        </div>
      </section>

      <section
        aria-label={isBrazil ? "Resumo da conta" : "Account summary"}
        className="grid gap-4 sm:grid-cols-2"
      >
        <LocalizedClientLink
          href="/account/profile"
          className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-fuchsia-300 hover:shadow-sm sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-700">
              <User size={22} />
            </div>
            <ArrowRightMini className="mt-1 text-gray-400 transition group-hover:translate-x-1 group-hover:text-fuchsia-700" />
          </div>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {isBrazil ? "Perfil completo" : "Profile completion"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {isBrazil
                  ? "Complete seus dados para agilizar suas compras."
                  : "Complete your details for a smoother checkout."}
              </p>
            </div>
            <span
              className="shrink-0 text-2xl font-semibold tracking-tight text-gray-900"
              data-testid="customer-profile-completion"
              data-value={profileCompletion}
            >
              {profileCompletion}%
            </span>
          </div>
          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100"
            role="progressbar"
            aria-label={isBrazil ? "Perfil completo" : "Profile completion"}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={profileCompletion}
          >
            <div
              className="h-full rounded-full bg-fuchsia-600 transition-all"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </LocalizedClientLink>

        <LocalizedClientLink
          href="/account/addresses"
          className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-fuchsia-300 hover:shadow-sm sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <MapPin size={22} />
            </div>
            <ArrowRightMini className="mt-1 text-gray-400 transition group-hover:translate-x-1 group-hover:text-fuchsia-700" />
          </div>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {isBrazil ? "Endereços salvos" : "Saved addresses"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {isBrazil
                  ? "Gerencie seus endereços de entrega e cobrança."
                  : "Manage your shipping and billing addresses."}
              </p>
            </div>
            <span
              className="shrink-0 text-2xl font-semibold tracking-tight text-gray-900"
              data-testid="addresses-count"
              data-value={addressCount}
            >
              {addressCount}
            </span>
          </div>
        </LocalizedClientLink>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isBrazil ? "Pedidos recentes" : "Recent orders"}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {isBrazil
                ? "Suas compras mais recentes em um só lugar."
                : "Your latest purchases, all in one place."}
            </p>
          </div>
          {orders && orders.length > 0 && (
            <LocalizedClientLink
              href="/account/orders"
              className="inline-flex items-center gap-1 text-sm font-semibold text-fuchsia-700 transition hover:text-fuchsia-800"
            >
              {isBrazil ? "Ver todos" : "View all"}
              <ArrowRightMini />
            </LocalizedClientLink>
          )}
        </div>

        {orders && orders.length > 0 ? (
          <ul className="divide-y divide-gray-100" data-testid="orders-wrapper">
            {orders.slice(0, 5).map((order) => (
              <li key={order.id} data-testid="order-wrapper" data-value={order.id}>
                <LocalizedClientLink
                  href={`/account/orders/details/${order.id}`}
                  className="group flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-gray-50 sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
                      <Package size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {isBrazil ? "Pedido" : "Order"}{" "}
                        <span data-testid="order-id" data-value={order.display_id}>
                          #{order.display_id}
                        </span>
                      </p>
                      <p
                        className="mt-1 text-xs text-gray-500"
                        data-testid="order-created-date"
                      >
                        {new Date(order.created_at).toLocaleDateString(
                          isBrazil ? "pt-BR" : "en-US",
                          { dateStyle: "medium" }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <span
                      className="text-sm font-semibold text-gray-900"
                      data-testid="order-amount"
                    >
                      {convertToLocale({
                        amount: order.total,
                        currency_code: order.currency_code,
                      })}
                    </span>
                    <ArrowRightMini className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-fuchsia-700" />
                  </div>
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        ) : (
          <div
            className="flex flex-col items-center px-6 py-10 text-center sm:py-12"
            data-testid="orders-wrapper"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-500">
              <Package size={26} />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              {isBrazil ? "Nenhum pedido por aqui ainda" : "No orders yet"}
            </h3>
            <p
              className="mt-1 max-w-sm text-xs leading-5 text-gray-500"
              data-testid="no-orders-message"
            >
              {isBrazil
                ? "Quando você fizer uma compra, poderá acompanhar todos os detalhes nesta área."
                : "Once you place an order, you can follow its details from here."}
            </p>
            <LocalizedClientLink
              href="/"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-fuchsia-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-fuchsia-800"
            >
              {isBrazil ? "Explorar jogos" : "Explore games"}
              <ArrowRightMini />
            </LocalizedClientLink>
          </div>
        )}
      </section>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  if (!customer) {
    return 0
  }

  let completedFields = 0

  if (customer.email) completedFields++
  if (customer.first_name && customer.last_name) completedFields++
  if (customer.phone) completedFields++
  if (customer.addresses?.some((address) => address.is_default_billing)) {
    completedFields++
  }

  return (completedFields / 4) * 100
}

export default Overview
