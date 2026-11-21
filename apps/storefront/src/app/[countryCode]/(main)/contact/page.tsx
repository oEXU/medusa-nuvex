import { Metadata } from "next"

import { STORE_NAME } from "@lib/util/site"
import { getStoreLanguage } from "@lib/util/store-locale"
import ContactForm from "@modules/policies/components/contact-form"
import {
  PolicyHero,
  PolicyLink,
  PolicyNavigation,
  PolicySection,
} from "@modules/policies/templates"

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Contact",
  description: `How to contact ${STORE_NAME}.`,
}

export default async function ContactPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const isBrazil = getStoreLanguage(countryCode) === "pt-BR"

  return (
    <div className="content-container mx-auto max-w-5xl py-10 small:py-14">
      <PolicyHero
        title={isBrazil ? "Fale com a gente" : "Contact us"}
        eyebrow={isBrazil ? "Atendimento NuveX" : "NuveX support"}
        description={
          isBrazil
            ? "Nossa equipe pode ajudar com pedidos, pagamentos, entregas, devoluções e produtos digitais."
            : "Our team can help with orders, payments, delivery, returns and digital products."
        }
        updated={
          isBrazil
            ? "Suporte online todos os dias"
            : "Online support every day"
        }
      />

      <div className="mt-8 grid gap-6 medium:grid-cols-[260px_minmax(0,1fr)]">
        <PolicyNavigation
          baseHref="/contact"
          ariaLabel={
            isBrazil
              ? "Conteúdo da página de contato"
              : "Contact page contents"
          }
          title={isBrazil ? "Neste documento" : "In this document"}
          items={
            isBrazil
              ? [
                  ["message", "Enviar mensagem"],
                  ["order", "Sobre seu pedido"],
                  ["channels", "Canais de atendimento"],
                  ["faq", "Antes de chamar"],
                ]
              : [
                  ["message", "Send a message"],
                  ["order", "About your order"],
                  ["channels", "Support channels"],
                  ["faq", "Before contacting"],
                ]
          }
        />

        <div className="flex flex-col gap-4">
          {isBrazil ? (
            <>
              <PolicySection id="message" number="01" title="Envie sua dúvida">
                <ContactForm isBrazil />
              </PolicySection>
              <PolicySection id="order" number="02" title="Sobre seu pedido">
                <p>
                  Ao falar conosco, informe o número do pedido e o e-mail usado
                  na compra. Essa informação ajuda a localizar o atendimento
                  com mais rapidez.
                </p>
                <p>
                  Para consultar status, página de rastreio ou detalhes da
                  entrega, acesse a área de pedidos da sua conta.
                </p>
              </PolicySection>
              <PolicySection id="channels" number="03" title="Canais de atendimento">
                <div className="grid gap-3 small:grid-cols-2">
                  <SupportCard
                    label="WhatsApp"
                    value="(11) 94796-2725"
                    href="https://wa.me/5511947962725"
                  />
                  <SupportCard
                    label="Loja"
                    value={STORE_NAME}
                    href="/account"
                  />
                </div>
              </PolicySection>
              <PolicySection id="faq" number="04" title="Antes de chamar">
                <p>
                  Confira as informações de{" "}
                  <PolicyLink href="/shipping">envio e entrega</PolicyLink>,{" "}
                  <PolicyLink href="/returns">devoluções</PolicyLink> e{" "}
                  <PolicyLink href="/terms">termos de uso</PolicyLink>.
                  Muitas respostas estão disponíveis imediatamente nesses
                  documentos.
                </p>
              </PolicySection>
            </>
          ) : (
            <>
              <PolicySection id="message" number="01" title="Send us a message">
                <ContactForm isBrazil={false} />
              </PolicySection>
              <PolicySection id="order" number="02" title="About your order">
                <p>
                  Include the order number and email used at checkout. This
                  helps us locate your request and respond more quickly.
                </p>
                <p>
                  To view status or delivery details, visit the order area in
                  your account.
                </p>
              </PolicySection>
              <PolicySection id="channels" number="03" title="Support channels">
                <div className="grid gap-3 small:grid-cols-2">
                  <SupportCard
                    label="WhatsApp"
                    value="+55 (11) 94796-2725"
                    href="https://wa.me/5511947962725"
                  />
                  <SupportCard
                    label="Store"
                    value={STORE_NAME}
                    href="/account"
                  />
                </div>
              </PolicySection>
              <PolicySection id="faq" number="04" title="Before contacting">
                <p>
                  Review our <PolicyLink href="/shipping">shipping information</PolicyLink>,{" "}
                  <PolicyLink href="/returns">returns policy</PolicyLink> and{" "}
                  <PolicyLink href="/terms">terms of use</PolicyLink>. Many
                  common answers are available in these pages.
                </p>
              </PolicySection>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SupportCard({
  label,
  value,
  href,
}: {
  label: string
  value: string
  href: string
}) {
  const isExternal = href.startsWith("http")

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className="group rounded-2xl border border-[#e8e5ef] bg-[#faf9fc] p-5 transition hover:-translate-y-0.5 hover:border-[#d8c3f3] hover:bg-white"
    >
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#817a91]">
        {label}
      </p>
      <p className="mt-2 flex items-center justify-between gap-3 font-bold text-[#1a103a]">
        {value}
        <span aria-hidden="true" className="text-[#6d28d9] transition group-hover:translate-x-1">
          →
        </span>
      </p>
    </a>
  )
}
