import Accordion, {
  type AccordionItem,
} from "@modules/common/components/accordion"
import { translate } from "@lib/util/store-locale"

export default function Faq({ countryCode }: { countryCode: string }) {
  const items: AccordionItem[] = [
    {
      id: "pagamentos",
      title: translate(countryCode, "faqPayments"),
      content: translate(countryCode, "faqPaymentsAnswer"),
    },
    {
      id: "prazo-entrega",
      title: translate(countryCode, "faqDelivery"),
      content: translate(countryCode, "faqDeliveryAnswer"),
    },
    {
      id: "rastreamento",
      title: translate(countryCode, "faqTracking"),
      content: translate(countryCode, "faqTrackingAnswer"),
    },
    {
      id: "garantia",
      title: translate(countryCode, "faqWarranty"),
      content: translate(countryCode, "faqWarrantyAnswer"),
    },
    {
      id: "troca-devolucao",
      title: translate(countryCode, "faqExchange"),
      content: translate(countryCode, "faqExchangeAnswer"),
    },
    {
      id: "midia-primaria-secundaria",
      title: translate(countryCode, "faqMedia"),
      content: translate(countryCode, "faqMediaAnswer"),
    },
  ]

  return (
    <section id="faq" className="bg-[#080b12] text-white">
      <div className="content-container max-w-7xl pb-20 small:pb-28">
        <div className="mb-6 border-b border-white/10 pb-4">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white small:text-4xl">
            {translate(countryCode, "faqHeading")}
          </h2>
        </div>
        <Accordion items={items} />
      </div>
    </section>
  )
}