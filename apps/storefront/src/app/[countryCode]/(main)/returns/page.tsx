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

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Política de devoluções",
  description: "Como solicitar devolução de produtos e reembolso.",
}

export default async function ReturnsPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const { current } = await getStorePolicies(countryCode)
  const isBrazil = getStoreLanguage(countryCode) === "pt-BR"

  return (
    <div className="content-container mx-auto max-w-5xl py-10 small:py-14">
      <PolicyHero
        title={isBrazil ? "Devoluções e reembolso" : "Returns and refunds"}
        eyebrow={isBrazil ? "Trocas e devoluções" : "Exchanges and returns"}
        description={
          isBrazil
            ? "Confira os prazos, as condições e as etapas para solicitar a devolução de um produto."
            : "Review the deadlines, conditions and steps to request a product return."
        }
        updated={
          isBrazil
            ? "Atualizado em 21 de novembro de 2026"
            : "Last updated: November 21, 2026"
        }
      />

      <div className="mt-8 grid gap-6 medium:grid-cols-[260px_minmax(0,1fr)]">
        <PolicyNavigation
          baseHref="/returns"
          ariaLabel={
            isBrazil
              ? "Conteúdo da política de devoluções"
              : "Return policy contents"
          }
          title={isBrazil ? "Neste documento" : "In this document"}
          items={
            isBrazil
              ? [
                  ["conditions", "Prazo e condições"],
                  ["how", "Como solicitar"],
                  ["refund", "Reembolso"],
                  ["digital", "Produtos digitais"],
                  ["inspection", "Inspeção do produto"],
                  ["contact", "Contato"],
                ]
              : [
                  ["conditions", "Deadline and conditions"],
                  ["how", "How to request"],
                  ["refund", "Refund"],
                  ["digital", "Digital products"],
                  ["inspection", "Product inspection"],
                  ["contact", "Contact"],
                ]
          }
        />

        <div className="flex flex-col gap-4">
          {current ? (
            <div className="grid gap-3 small:grid-cols-3">
              <SummaryCard
                label={isBrazil ? "Prazo" : "Deadline"}
                value={
                  isBrazil
                    ? `${current.returnWindowDays} dias`
                    : `${current.returnWindowDays} days`
                }
                detail={
                  isBrazil
                    ? "Após a entrega"
                    : "After delivery"
                }
              />
              <SummaryCard
                label={isBrazil ? "Frete de devolução" : "Return shipping"}
                value={
                  isBrazil
                    ? current.freeReturns
                      ? "Grátis"
                      : "Por conta do cliente"
                    : current.freeReturns
                      ? "Free"
                      : "Customer paid"
                }
              />
              <SummaryCard
                label={isBrazil ? "Forma" : "Method"}
                value={isBrazil ? "Correio" : "By mail"}
                detail={
                  isBrazil
                    ? "Com autorização"
                    : "With authorization"
                }
              />
            </div>
          ) : null}

          {isBrazil ? (
            <>
              <PolicySection id="conditions" number="01" title="Prazo e condições">
                {current ? (
                  <>
                    <p>
                      Solicitações podem ser feitas em até {current.returnWindowDays} dias
                      após o recebimento do pedido. O produto deve estar sem
                      uso, sem danos causados pelo cliente e acompanhado dos
                      itens fornecidos na compra.
                    </p>
                    <p>
                      {current.freeReturns
                        ? "O frete da devolução é gratuito conforme as condições desta região."
                        : "Os custos do frete de devolução são pagos pelo cliente, salvo quando houver defeito ou envio incorreto."}
                    </p>
                  </>
                ) : (
                  <PoliciesUnavailable />
                )}
              </PolicySection>
              <PolicySection id="how" number="02" title="Como solicitar">
                <p>
                  Entre em contato informando o número do pedido, os itens que
                  deseja devolver e o motivo da solicitação. Aguarde a
                  autorização antes de enviar o produto.
                </p>
                <p>
                  Embale o item com cuidado e utilize apenas os dados de
                  postagem informados pela equipe. Devoluções enviadas sem
                  autorização podem atrasar a análise.
                </p>
              </PolicySection>
              <PolicySection id="refund" number="03" title="Reembolso">
                <p>
                  Depois que a devolução passar pela inspeção, o reembolso será
                  enviado ao método de pagamento utilizado na compra.
                </p>
                <p>
                  O prazo da instituição financeira ou da operadora do cartão
                  pode variar. O valor não será liberado enquanto houver
                  pendência sobre o conteúdo ou a embalagem devolvida.
                </p>
              </PolicySection>
              <PolicySection id="digital" number="04" title="Produtos digitais">
                <p>
                  Chaves de ativação, códigos e entregas digitais podem ter
                  restrições diferentes. Solicitações envolvendo conteúdo
                  inválido ou não entregue devem ser informadas assim que
                  identificadas.
                </p>
                <p>
                  Após entrega, ativação ou uso da chave, o cancelamento poderá
                  não se aplicar, exceto nos casos previstos em lei ou quando
                  houver falha comprovada no item.
                </p>
              </PolicySection>
              <PolicySection id="inspection" number="05" title="Inspeção do produto">
                <p>
                  O produto deve ser devolvido nas condições recebidas, incluindo
                  acessórios, embalagens originais e manuais quando aplicável.
                  Danos, uso excessivo ou falta de itens podem alterar a análise.
                </p>
              </PolicySection>
              <PolicySection id="contact" number="06" title="Contato">
                <p>
                  Solicite uma devolução pela
                  {" "}<PolicyLink href="/contact">página de contato</PolicyLink>.
                  Inclua o número do pedido e fotos do produto quando houver
                  defeito, avaria ou divergência.
                </p>
                <p>
                  Consulte também os <PolicyLink href="/terms">termos de uso</PolicyLink>.
                </p>
              </PolicySection>
            </>
          ) : (
            <>
              <PolicySection id="conditions" number="01" title="Deadline and conditions">
                {current ? (
                  <>
                    <p>
                      Requests may be made within {current.returnWindowDays} days
                      after receiving the order. The product must be unused,
                      without customer-caused damage and include the items
                      provided with the purchase.
                    </p>
                    <p>
                      {current.freeReturns
                        ? "Return shipping is free under the conditions for this region."
                        : "Return shipping costs are paid by the customer unless the item is defective or sent incorrectly."}
                    </p>
                  </>
                ) : (
                  <PoliciesUnavailable />
                )}
              </PolicySection>
              <PolicySection id="how" number="02" title="How to request">
                <p>
                  Contact us with the order number, items you want to return and
                  the reason for the request. Wait for authorization before
                  shipping the product.
                </p>
                <p>
                  Pack the item carefully and use only the shipping details
                  provided by our team. Unauthorized returns may delay review.
                </p>
              </PolicySection>
              <PolicySection id="refund" number="03" title="Refund">
                <p>
                  After the return passes inspection, the refund is sent to the
                  payment method used for the purchase.
                </p>
                <p>
                  Processing time depends on the financial institution or card
                  issuer. The refund remains pending while issues with the
                  returned item or packaging are unresolved.
                </p>
              </PolicySection>
              <PolicySection id="digital" number="04" title="Digital products">
                <p>
                  Activation keys, codes and digital deliveries may have
                  different restrictions. Invalid or undelivered content should
                  be reported as soon as it is identified.
                </p>
                <p>
                  Once a key or digital code has been delivered, activated or
                  used, cancellation may not apply except where required by law
                  or when the item is demonstrably faulty.
                </p>
              </PolicySection>
              <PolicySection id="inspection" number="05" title="Product inspection">
                <p>
                  Products must be returned in the condition received, including
                  accessories, original packaging and manuals where applicable.
                  Damage, excessive use or missing items may affect the review.
                </p>
              </PolicySection>
              <PolicySection id="contact" number="06" title="Contact">
                <p>
                  Submit a return request through the
                  {" "}<PolicyLink href="/contact">contact page</PolicyLink>.
                  Include the order number and photos if the item is damaged,
                  defective or different from the purchase.
                </p>
                <p>
                  You can also review our <PolicyLink href="/terms">terms of use</PolicyLink>.
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
