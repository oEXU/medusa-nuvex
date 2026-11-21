import { Metadata } from "next"

import { getStorePolicies } from "@lib/data/store-policies"
import { getStoreLanguage } from "@lib/util/store-locale"
import {
  PoliciesUnavailable,
  PolicyHero,
  PolicyLink,
  PolicyNavigation,
  PolicySection,
} from "@modules/policies/templates"
import { formatDayRange } from "@lib/util/store-policies"
import { formatShippingRate } from "@modules/policies/templates"

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Shipping information",
  description: "Shipping rates and delivery times.",
}

export default async function ShippingPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const { current, currencyCode } = await getStorePolicies(countryCode)
  const isBrazil = getStoreLanguage(countryCode) === "pt-BR"

  return (
    <div className="content-container mx-auto max-w-5xl py-10 small:py-14">
      <PolicyHero
        title={isBrazil ? "Envio e entrega" : "Shipping and delivery"}
        eyebrow={isBrazil ? "Informações de envio" : "Shipping information"}
        description={
          isBrazil
            ? "Veja como seu pedido é processado, enviado e acompanhado até a entrega."
            : "See how your order is processed, shipped and tracked until delivery."
        }
        updated={
          isBrazil
            ? "Atualizado em 21 de novembro de 2026"
            : "Last updated: November 21, 2026"
        }
      />

      <div className="mt-8 grid gap-6 medium:grid-cols-[260px_minmax(0,1fr)]">
        <PolicyNavigation
          baseHref="/shipping"
          ariaLabel={
            isBrazil
              ? "Conteúdo da página de envio"
              : "Shipping information contents"
          }
          title={isBrazil ? "Neste documento" : "In this document"}
          items={
            isBrazil
              ? [
                  ["methods", "Frete e prazos"],
                  ["processing", "Processamento"],
                  ["tracking", "Rastreio"],
                  ["restrictions", "Restrições"],
                  ["digital", "Entrega digital"],
                  ["contact", "Precisa de ajuda"],
                ]
              : [
                  ["methods", "Rates and times"],
                  ["processing", "Processing"],
                  ["tracking", "Tracking"],
                  ["restrictions", "Restrictions"],
                  ["digital", "Digital delivery"],
                  ["contact", "Need help"],
                ]
          }
        />

        <div className="flex flex-col gap-4">
          {current ? (
            <div className="grid gap-3 small:grid-cols-3">
              <SummaryCard
                label={isBrazil ? "Frete" : "Shipping"}
                value={formatShippingRate(current.shippingRate, currencyCode)}
                detail={
                  isBrazil
                    ? `Destinos: ${countryCode.toUpperCase()}`
                    : `Destination: ${countryCode.toUpperCase()}`
                }
              />
              <SummaryCard
                label={isBrazil ? "Preparação" : "Processing"}
                value={`${formatDayRange(current.handlingDays)} dias`}
                detail={isBrazil ? "Dias úteis" : "Business days"}
              />
              <SummaryCard
                label={isBrazil ? "Entrega" : "Delivery"}
                value={`${formatDayRange(current.transitDays)} dias`}
                detail={
                  isBrazil
                    ? "Após o envio"
                    : "After dispatch"
                }
              />
            </div>
          ) : null}

          {isBrazil ? (
            <>
              <PolicySection id="methods" number="01" title="Frete e prazos">
                {current ? (
                  <>
                    <p>
                      Os pedidos enviados para {countryCode.toUpperCase()} são
                      despachados pela opção disponível para sua região.
                    </p>
                    <p>
                      O prazo de entrega final pode variar por localidade,
                      calendário da transportadora e confirmação do pagamento.
                      Valores e métodos disponíveis são apresentados no checkout.
                    </p>
                  </>
                ) : (
                  <PoliciesUnavailable />
                )}
              </PolicySection>
              <PolicySection id="processing" number="02" title="Processamento do pedido">
                <p>
                  Após a confirmação do pagamento, reservamos os itens e iniciamos
                  a preparação. Pedidos em dias úteis podem seguir para despacho
                  dentro do prazo informado acima.
                </p>
                <p>
                  Feriados regionais e validações adicionais de segurança podem
                  aumentar o tempo de processamento.
                </p>
              </PolicySection>
              <PolicySection id="tracking" number="03" title="Rastreio da entrega">
                <p>
                  Assim que o pedido for coletado, o código de rastreio é enviado
                  para o e-mail utilizado na compra. A atualização pode levar até
                  24 horas após a postagem.
                </p>
                <p>
                  Consulte também a área de pedidos da sua conta para acompanhar
                  o status e acessar os detalhes disponíveis.
                </p>
              </PolicySection>
              <PolicySection id="restrictions" number="04" title="Restrições e endereço">
                <p>
                  A entrega só pode ser realizada em um endereço completo e
                  acessível para a transportadora. Caixa postal ou dados
                  incompletos podem impedir o despacho.
                </p>
                <p>
                  Pedidos suspeitos de fraude ou divergentes podem aguardar
                  validação antes do envio.
                </p>
              </PolicySection>
              <PolicySection id="digital" number="05" title="Entrega digital">
                <p>
                  Chaves, códigos e arquivos digitais são enviados para o e-mail
                  informado no checkout. Confirme sua caixa de entrada e a pasta
                  de spam após a aprovação do pagamento.
                </p>
              </PolicySection>
              <PolicySection id="contact" number="06" title="Precisa de ajuda">
                <p>
                  Para atrasos, divergências de endereço ou ausência de rastreio,
                  entre em contato pela
                  {" "}<PolicyLink href="/contact">página de atendimento</PolicyLink>
                  {" "}e informe o número do pedido.
                </p>
              </PolicySection>
            </>
          ) : (
            <>
              <PolicySection id="methods" number="01" title="Rates and delivery times">
                {current ? (
                  <>
                    <p>
                      Orders shipped to {countryCode.toUpperCase()} use the
                      shipping option available for the selected region.
                    </p>
                    <p>
                      Final delivery time may vary by locality, carrier schedule
                      and payment confirmation. Available methods and final costs
                      are shown at checkout.
                    </p>
                  </>
                ) : (
                  <PoliciesUnavailable />
                )}
              </PolicySection>
              <PolicySection id="processing" number="02" title="Order processing">
                <p>
                  After payment confirmation, we reserve the items and begin
                  preparation. Orders placed on business days can be dispatched
                  within the processing time shown above.
                </p>
                <p>
                  Regional holidays and additional security checks may extend
                  processing time.
                </p>
              </PolicySection>
              <PolicySection id="tracking" number="03" title="Tracking delivery">
                <p>
                  Once the order is collected, the tracking code is sent to the
                  email used for purchase. It may take up to 24 hours for carrier
                  activity to appear.
                </p>
                <p>
                  You can also use your account order area to view available
                  status updates.
                </p>
              </PolicySection>
              <PolicySection id="restrictions" number="04" title="Restrictions and address">
                <p>
                  Delivery requires a complete address accessible to the carrier.
                  P.O. boxes or incomplete details may prevent dispatch.
                </p>
                <p>
                  Orders considered suspicious or requiring fraud review may be
                  held for validation before shipping.
                </p>
              </PolicySection>
              <PolicySection id="digital" number="05" title="Digital delivery">
                <p>
                  Keys, codes and digital files are sent to the email entered at
                  checkout. Check your inbox and spam folder after payment approval.
                </p>
              </PolicySection>
              <PolicySection id="contact" number="06" title="Need help">
                <p>
                  For delays, address changes or missing tracking information,
                  visit our
                  {" "}<PolicyLink href="/contact">contact page</PolicyLink>
                  {" "}and include the order number.
                </p>
              </PolicySection>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <div className="rounded-2xl border border-[#e8e5ef] bg-[#faf9fc] p-5">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#817a91]">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold text-[#1a103a]">{value}</p>
      {detail ? (
        <p className="mt-1 text-xs text-[#817a91]">{detail}</p>
      ) : null}
    </div>
  )
}
