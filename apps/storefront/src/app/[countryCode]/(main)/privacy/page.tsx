import { Metadata } from "next"

import { STORE_NAME } from "@lib/util/site"
import { getStoreLanguage } from "@lib/util/store-locale"
import {
  PolicyHero,
  PolicyLink,
  PolicyNavigation,
  PolicySection,
} from "@modules/policies/templates"

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: `Como a ${STORE_NAME} coleta e utiliza dados pessoais.`,
}

export default async function PrivacyPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const isBrazil = getStoreLanguage(countryCode) === "pt-BR"

  return (
    <div className="content-container mx-auto max-w-5xl py-10 small:py-14">
      <PolicyHero
        title={isBrazil ? "Política de privacidade" : "Privacy policy"}
        eyebrow={isBrazil ? "Dados e privacidade" : "Data and privacy"}
        description={
          isBrazil
            ? `Saiba quais dados a ${STORE_NAME} coleta, como eles são utilizados e quais são suas escolhas.`
            : `Learn what data ${STORE_NAME} collects, how it is used and what choices are available to you.`
        }
        updated={
          isBrazil
            ? "Atualizado em 21 de novembro de 2026"
            : "Last updated: November 21, 2026"
        }
      />

      <div className="mt-8 grid gap-6 medium:grid-cols-[260px_minmax(0,1fr)]">
        <PolicyNavigation
          baseHref="/privacy"
          ariaLabel={
            isBrazil
              ? "Conteúdo da política de privacidade"
              : "Privacy policy contents"
          }
          title={isBrazil ? "Neste documento" : "In this document"}
          items={
            isBrazil
              ? [
                  ["collection", "Dados coletados"],
                  ["purpose", "Como utilizamos"],
                  ["cookies", "Cookies"],
                  ["sharing", "Compartilhamento"],
                  ["security", "Segurança"],
                  ["rights", "Direitos e escolhas"],
                  ["retention", "Armazenamento"],
                  ["contact", "Contato"],
                ]
              : [
                  ["collection", "Data collected"],
                  ["purpose", "How we use data"],
                  ["cookies", "Cookies"],
                  ["sharing", "Sharing"],
                  ["security", "Security"],
                  ["rights", "Rights and choices"],
                  ["retention", "Storage"],
                  ["contact", "Contact"],
                ]
          }
        />

        <div className="flex flex-col gap-4">
          {isBrazil ? (
            <>
              <PolicySection id="collection" number="01" title="Dados coletados">
                <p>
                  Podemos coletar nome, e-mail, telefone, endereço de entrega,
                  informações da conta e dados necessários para processar e
                  entregar um pedido.
                </p>
                <p>
                  Dados técnicos, como endereço IP, dispositivo, navegador e
                  páginas acessadas, podem ser registrados para segurança,
                  prevenção a fraudes e melhoria da experiência.
                </p>
              </PolicySection>
              <PolicySection id="purpose" number="02" title="Como utilizamos os dados">
                <p>
                  Usamos as informações para confirmar pedidos, realizar
                  pagamentos, organizar entregas, prestar suporte e enviar
                  comunicações relacionadas à compra.
                </p>
                <p>
                  Também podemos utilizar dados de forma agregada para analisar
                  desempenho da loja, prevenir abusos e aperfeiçoar nossos
                  serviços.
                </p>
              </PolicySection>
              <PolicySection id="cookies" number="03" title="Cookies e tecnologias semelhantes">
                <p>
                  Cookies ajudam a manter o carrinho, lembrar preferências,
                  reconhecer sessões iniciadas e medir o uso da loja.
                </p>
                <p>
                  Você pode bloquear ou remover cookies nas configurações do
                  navegador. Alguns recursos podem deixar de funcionar
                  corretamente quando cookies essenciais são desativados.
                </p>
              </PolicySection>
              <PolicySection id="sharing" number="04" title="Compartilhamento">
                <p>
                  Compartilhamos dados somente quando necessário com serviços de
                  pagamento, logística, atendimento, prevenção a fraude e
                  infraestrutura que ajudam a operar a loja.
                </p>
                <p>
                  Essas informações podem ser divulgadas ainda quando exigidas
                  por obrigação legal ou para proteger direitos, segurança e
                  integridade de clientes e da plataforma.
                </p>
              </PolicySection>
              <PolicySection id="security" number="05" title="Segurança">
                <p>
                  Adotamos medidas técnicas e organizacionais destinadas a
                  proteger os dados contra acesso indevido, alteração ou perda.
                  Nenhum sistema, porém, oferece garantia absoluta contra
                  incidentes.
                </p>
              </PolicySection>
              <PolicySection id="rights" number="06" title="Direitos e escolhas">
                <p>
                  Conforme aplicável, você pode solicitar acesso, correção,
                  atualização ou exclusão de dados pessoais, além de informações
                  sobre o tratamento realizado.
                </p>
                <p>
                  Comunicações comerciais podem ser interrompidas conforme os
                  canais disponibilizados em cada mensagem ou pelo atendimento.
                </p>
              </PolicySection>
              <PolicySection id="retention" number="07" title="Armazenamento">
                <p>
                  Mantemos os dados pelo tempo necessário às finalidades
                  descritas nesta política, obrigações legais, prevenção a
                  fraudes e resolução de disputas.
                </p>
              </PolicySection>
              <PolicySection id="contact" number="08" title="Contato">
                <p>
                  Para solicitar alterações nos seus dados ou enviar dúvidas sobre
                  privacidade, use a
                  {" "}<PolicyLink href="/contact">página de contato</PolicyLink>.
                  Consulte também nossos <PolicyLink href="/terms">termos de uso</PolicyLink>.
                </p>
              </PolicySection>
            </>
          ) : (
            <>
              <PolicySection id="collection" number="01" title="Data collected">
                <p>
                  We may collect name, email, phone number, shipping address,
                  account information and data required to process and deliver
                  an order.
                </p>
                <p>
                  Technical data such as IP address, device, browser and accessed
                  pages may be recorded for security, fraud prevention and
                  experience improvement.
                </p>
              </PolicySection>
              <PolicySection id="purpose" number="02" title="How we use data">
                <p>
                  We use information to confirm orders, process payments,
                  arrange deliveries, provide support and send communications
                  related to purchases.
                </p>
                <p>
                  We may also use aggregated data to analyze store performance,
                  prevent abuse and improve our services.
                </p>
              </PolicySection>
              <PolicySection id="cookies" number="03" title="Cookies and similar technologies">
                <p>
                  Cookies keep your cart, remember preferences, recognize
                  signed-in sessions and measure store usage.
                </p>
                <p>
                  You may block or remove cookies in your browser settings.
                  Essential features may stop working when essential cookies are
                  disabled.
                </p>
              </PolicySection>
              <PolicySection id="sharing" number="04" title="Sharing">
                <p>
                  We share data only when necessary with payment, logistics,
                  support, fraud-prevention and infrastructure providers that
                  help operate the store.
                </p>
                <p>
                  Data may also be disclosed when required by law or to protect
                  rights, safety and the integrity of customers and the platform.
                </p>
              </PolicySection>
              <PolicySection id="security" number="05" title="Security">
                <p>
                  We use technical and organizational measures intended to
                  protect data against unauthorized access, alteration or loss.
                  However, no system can guarantee absolute security.
                </p>
              </PolicySection>
              <PolicySection id="rights" number="06" title="Rights and choices">
                <p>
                  Where applicable, you may request access, correction,
                  updating or deletion of personal data and information about
                  how it is processed.
                </p>
                <p>
                  Marketing communications can be stopped using the controls
                  provided in each message or through customer support.
                </p>
              </PolicySection>
              <PolicySection id="retention" number="07" title="Storage">
                <p>
                  We retain data for as long as needed for the purposes described
                  in this policy, legal obligations, fraud prevention and dispute
                  resolution.
                </p>
              </PolicySection>
              <PolicySection id="contact" number="08" title="Contact">
                <p>
                  To request changes to your data or ask about privacy, use the
                  {" "}<PolicyLink href="/contact">contact page</PolicyLink>.
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
