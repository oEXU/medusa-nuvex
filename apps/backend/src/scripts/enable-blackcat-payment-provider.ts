import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"

const PROVIDER_ID = "pp_blackcat_blackcat"

export default async function enableBlackcatPaymentProvider({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const paymentModule = container.resolve(Modules.PAYMENT)
  const providers = await paymentModule.listPaymentProviders({ is_enabled: true })
  if (!providers.some((provider) => provider.id === PROVIDER_ID)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "BlackCat payment credentials must be configured and the backend restarted before enabling the provider."
    )
  }
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "countries.iso_2", "payment_providers.id"],
  })
  const brazilRegion = regions.find((region) =>
    region.countries?.some((country) => country?.iso_2 === "br")
  )

  if (!brazilRegion) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Brazil region was not found; create it before enabling BlackCat."
    )
  }

  const regionProviders = (brazilRegion.payment_providers ?? [])
    .map((provider) => provider?.id)
    .filter((providerId): providerId is string => typeof providerId === "string")

  if (regionProviders.includes(PROVIDER_ID)) {
    logger.info("BlackCat is already enabled for the Brazil region.")
    return
  }

  await updateRegionsWorkflow(container).run({
    input: {
      selector: { id: brazilRegion.id },
      update: { payment_providers: [...regionProviders, PROVIDER_ID] },
    },
  })
  logger.info("Enabled BlackCat as a payment provider for the Brazil region.")
}
