import { Metadata } from "next"

import { STORE_NAME } from "@lib/util/site"
import { getStoreLanguage } from "@lib/util/store-locale"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Termos de uso",
  description: `Regras aplicáveis às compras e ao uso da loja ${STORE_NAME}.`,
}

export default async function TermsPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const isBrazil = getStoreLanguage(countryCode) === "pt-BR"

  if (!isBrazil) {
    return (
      <div className="content-container mx-auto max-w-5xl py-10 small:py-14">
        <TermsIntro
          title="Terms of use"
          eyebrow="Rules and purchasing"
          description={`These terms explain how ${STORE_NAME} operates and establish the rules applicable to purchases made through this website.`}
          updated="Last updated: November 21, 2026"
        />

        <div className="mt-8 grid gap-6 medium:grid-cols-[260px_minmax(0,1fr)]">
          <TermsNavigation
            items={[
              ["scope", "Scope"],
              ["account", "Accounts"],
              ["purchases", "Purchases and payment"],
              ["digital-products", "Digital products"],
              ["returns", "Cancellation and refunds"],
              ["responsibilities", "Responsibilities"],
              ["changes", "Changes"],
              ["contact", "Contact"],
            ]}
          />
          <div className="flex flex-col gap-4">
            <TermsSection id="scope" number="01" title="Scope">
              <p>
                By browsing or placing an order with {STORE_NAME}, you agree to
                these Terms of Use and to the applicable Privacy, Shipping and
                Return policies.
              </p>
            </TermsSection>
            <TermsSection id="account" number="02" title="Accounts">
              <p>
                Keep your login details confidential and provide accurate
                information. You are responsible for activity performed through
                your account. Unauthorized use should be reported promptly.
              </p>
            </TermsSection>
            <TermsSection id="purchases" number="03" title="Purchases and payment">
              <p>
                Prices, availability, delivery methods and applicable charges
                are shown on the product page and at checkout. An order is
                confirmed only after payment approval and confirmation is sent
                by email.
              </p>
              <p>
                Payment data is processed by the selected payment provider. The
                store may request identity or payment validation to prevent
                fraud and security risks.
              </p>
            </TermsSection>
            <TermsSection id="digital-products" number="04" title="Digital products">
              <p>
                Digital products may include download links, activation keys or
                access instructions. Delivery, regional restrictions and platform
                requirements must be checked before purchase.
              </p>
              <p>
                Keys and licenses are subject to the publisher&apos;s and
                platform&apos;s end-user terms. Reselling, sharing or redistributing
                access outside the permitted use is prohibited.
              </p>
            </TermsSection>
            <TermsSection id="returns" number="05" title="Cancellation and refunds">
              <p>
                Cancellation, replacement and refund requests are handled under
                our <PolicyLink href="/returns">return policy</PolicyLink>.
              </p>
              <p>
                Once a digital key or activation link has been delivered, used
                or activated, it may no longer be eligible for cancellation
                except where required by applicable law or for an invalid item.
              </p>
            </TermsSection>
            <TermsSection id="responsibilities" number="06" title="Responsibilities">
              <p>
                We aim to keep product information accurate and the website
                available, but we do not guarantee uninterrupted access or the
                absence of technical errors. Nothing here excludes rights that
                cannot be excluded by law.
              </p>
            </TermsSection>
            <TermsSection id="changes" number="07" title="Changes to these terms">
              <p>
                We may update these terms to reflect legal, operational or
                commercial changes. The updated version will be identified by
                its publication date and apply from its effective date.
              </p>
            </TermsSection>
            <TermsSection id="contact" number="08" title="Contact">
              <p>
                Questions about an order or these terms can be sent through the
                {" "}<PolicyLink href="/contact">contact page</PolicyLink>.
              </p>
            </TermsSection>
          </div>
        </div>
      </div>
    )
  }

  function TermsIntro({
    title,
    eyebrow,
    description,
    updated,
  }: {
    title: string
    eyebrow: string
    description: string
    updated: string
  }) {
    return (
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
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/60">
            <span>{updated}</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-pink-300" />
            <LocalizedClientLink
              href="/privacy"
              className="font-semibold text-pink-200 transition hover:text-white"
            >
              {title === "Termos de uso"
                ? "Política de privacidade"
                : "Privacy policy"}
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    )
  }

  function TermsNavigation({
    items,
  }: {
    items: [string, string][]
  }) {
    return (
      <nav
        aria-label="Conteúdo dos termos"
        className="h-fit rounded-2xl border border-[#e8e5ef] bg-[#faf9fc] p-3 medium:sticky medium:top-32"
      >
        <p className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#817a91]">
          Neste documento
        </p>
        <div className="flex flex-col">
          {items.map(([id, label]) => (
            <LocalizedClientLink
              key={id}
              href={`/terms#${id}`}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#4b4658] transition hover:bg-white hover:text-[#6d28d9]"
            >
              {label}
            </LocalizedClientLink>
          ))}
        </div>
      </nav>
    )
  }

  function TermsSection({
    id,
    number,
    title,
    children,
  }: {
    id: string
    number: string
    title: string
    children: React.ReactNode
  }) {
    return (
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
  }

  function PolicyLink({
    href,
    children,
  }: {
    href: string
    children: React.ReactNode
  }) {
    return (
      <LocalizedClientLink
        href={href}
        className="font-semibold text-[#6d28d9] underline decoration-[#b99de7] underline-offset-4 transition hover:text-[#4c1d95]"
      >
        {children}
      </LocalizedClientLink>
    )
  }

  return (
    <div className="content-container mx-auto max-w-5xl py-10 small:py-14">
      <TermsIntro
        title="Termos de uso"
        eyebrow="Regras e compras"
        description={`Estes termos explicam como a ${STORE_NAME} funciona e estabelecem as regras aplicáveis às compras realizadas neste site.`}
        updated="Atualizado em 21 de novembro de 2026"
      />

      <div className="mt-8 grid gap-6 medium:grid-cols-[260px_minmax(0,1fr)]">
        <TermsNavigation
          items={[
            ["scope", "Abrangência"],
            ["account", "Conta do cliente"],
            ["purchases", "Compras e pagamento"],
            ["digital-products", "Produtos digitais"],
            ["returns", "Cancelamento e reembolso"],
            ["responsibilities", "Responsabilidades"],
            ["changes", "Alterações"],
            ["contact", "Contato"],
          ]}
        />
        <div className="flex flex-col gap-4">
          <TermsSection id="scope" number="01" title="Abrangência">
            <p>
              Ao navegar ou realizar uma compra na {STORE_NAME}, você concorda
              com estes Termos de Uso e com as políticas de Privacidade,
              Entrega e Devoluções aplicáveis.
            </p>
            <p>
              Recomendamos que leia os termos antes de concluir o pedido. O uso
              da loja somente é permitido por pessoas capazes de celebrar
              contratos conforme a legislação aplicável.
            </p>
          </TermsSection>

          <TermsSection id="account" number="02" title="Conta do cliente">
            <p>
              Seus dados de acesso devem permanecer confidenciais. Você é
              responsável pelas informações fornecidas e pelas atividades
              realizadas em sua conta.
            </p>
            <p>
              Caso identifique uso não autorizado, entre em contato conosco
              imediatamente. Informações incorretas ou tentativa de fraude
              podem impedir a confirmação do pedido.
            </p>
          </TermsSection>

          <TermsSection id="purchases" number="03" title="Compras e pagamento">
            <p>
              Preços, disponibilidade, formas de entrega e eventuais cobranças
              são apresentados na página do produto e na finalização da compra.
              O pedido é confirmado somente após a aprovação do pagamento e o
              envio da confirmação por e-mail.
            </p>
            <p>
              Os dados financeiros são processados pelo provedor de pagamento
              escolhido. Para prevenção a fraudes e riscos de segurança, a
              loja poderá solicitar validação da compra ou da identidade.
            </p>
          </TermsSection>

          <TermsSection id="digital-products" number="04" title="Produtos digitais">
            <p>
              Jogos e outros produtos digitais podem incluir chave de ativação,
              instruções de download ou acesso por plataforma externa. Antes
              da compra, confira região, plataforma, idioma e requisitos.
            </p>
            <p>
              Chaves e licenças estão sujeitas aos termos do fabricante e da
              plataforma. É proibido revender, compartilhar, redistribuir ou
              utilizar o conteúdo fora da licença adquirida.
            </p>
          </TermsSection>

          <TermsSection id="returns" number="05" title="Cancelamento e reembolso">
            <p>
              Pedidos podem ser cancelados ou devolvidos conforme a
            {" "}<PolicyLink href="/returns">política de devoluções</PolicyLink>,
              desde que respeitados os prazos e as condições aplicáveis.
            </p>
            <p>
              Quando uma chave ou link digital já tiver sido entregue, usado ou
              ativado, o cancelamento poderá não se aplicar, exceto nos casos
              previstos em lei ou quando o conteúdo entregue estiver inválido.
            </p>
          </TermsSection>

          <TermsSection id="responsibilities" number="06" title="Responsabilidades">
            <p>
              Trabalhamos para manter as informações corretas e o site
              disponível, mas não garantimos funcionamento ininterrupto ou
              ausência de falhas técnicas. Nenhum termo exclui direitos
              assegurados ao consumidor pela legislação brasileira.
            </p>
            <p>
              Não nos responsabilizamos por uso indevido da conta, incompatibilidade
              não informada pelo cliente ou problemas causados por plataformas,
              fabricantes e provedores externos.
            </p>
          </TermsSection>

          <TermsSection id="changes" number="07" title="Alterações destes termos">
            <p>
              Podemos atualizar estes termos para refletir mudanças legais,
              operacionais ou comerciais. A versão vigente será identificada
              pela data de atualização e passará a valer a partir da publicação.
            </p>
          </TermsSection>

          <TermsSection id="contact" number="08" title="Contato">
            <p>
              Para dúvidas sobre um pedido ou sobre estes termos, envie sua
              solicitação pela
              {" "}<PolicyLink href="/contact">página de contato</PolicyLink>.
              Sempre informe o número do pedido para agilizar o atendimento.
            </p>
          </TermsSection>
        </div>
      </div>
    </div>
  )
}
