import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  ModuleRegistrationName,
  Modules,
} from "@medusajs/framework/utils"
import {
  createShippingOptionsWorkflow,
  updateShippingOptionsWorkflow,
} from "@medusajs/medusa/core-flows"

const BRAZIL_SHIPPING_RATE = 0
const PROVIDER_ID = "manual_manual"
const SHIPPING_OPTIONS = [
  { name: "PAC", code: "pac" },
  { name: "SEDEX", code: "sedex" },
]

export default async function ensureBrazilDelivery({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT,
  )

  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: [
      "id",
      "name",
      "address.country_code",
      "fulfillment_sets.id",
      "fulfillment_sets.name",
      "fulfillment_sets.type",
      "fulfillment_sets.service_zones.id",
      "fulfillment_sets.service_zones.geo_zones.country_code",
      "fulfillment_providers.id",
    ],
  })
  const brazilLocations = locations.filter(
    (location) => location.address?.country_code?.toLowerCase() === "br",
  )
  const stockLocation =
    brazilLocations.find((location) => location.name === "Jundiai, SP") ??
    (brazilLocations.length === 1 ? brazilLocations[0] : undefined)

  if (!stockLocation) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      'A unique Brazilian stock location is required. Create or select "Jundiai, SP" in the Medusa Admin.',
    )
  }

  const shippingSets = (stockLocation.fulfillment_sets ?? []).filter(
    (set): set is NonNullable<typeof set> => !!set && set.type === "shipping",
  )
  const fulfillmentSet =
    shippingSets.find((set) => set.name === "Jundiai, SP shipping") ??
    (shippingSets.length === 1 ? shippingSets[0] : undefined)

  if (!fulfillmentSet) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `A unique shipping fulfillment set linked to "${stockLocation.name}" is required.`,
    )
  }

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name"],
  })
  const shippingProfile = shippingProfiles.find(
    (profile) => profile.name === "Default Shipping Profile",
  )

  if (!shippingProfile) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      'The "Default Shipping Profile" is required to configure Brazilian delivery.',
    )
  }

  const linkedProviders = (stockLocation.fulfillment_providers ?? []).filter(
    (item): item is NonNullable<typeof item> => !!item,
  )
  const provider = linkedProviders.find(
    (item) => item.id === PROVIDER_ID,
  )

  if (!provider) {
    const { data: providers } = await query.graph({
      entity: "fulfillment_provider",
      fields: ["id", "is_enabled"],
      filters: { id: PROVIDER_ID },
    })

    if (
      !providers.some(
        (item) => !!item && item.id === PROVIDER_ID && item.is_enabled,
      )
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Fulfillment provider "${PROVIDER_ID}" is not enabled.`,
      )
    }

    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: PROVIDER_ID,
      },
    })
  }

  const existingServiceZones = (fulfillmentSet.service_zones ?? []).filter(
    (zone): zone is NonNullable<typeof zone> => !!zone,
  )
  let serviceZoneId = existingServiceZones.find((zone) =>
    zone.geo_zones?.some(
      (geoZone) => !!geoZone && geoZone.country_code?.toLowerCase() === "br",
    ),
  )?.id

  if (!serviceZoneId) {
    const serviceZone = await fulfillmentModuleService.createServiceZones({
      name: "Brazil",
      fulfillment_set_id: fulfillmentSet.id,
      geo_zones: [{ country_code: "br", type: "country" }],
    })
    serviceZoneId = serviceZone.id
  }

  const { data: existingOptions } = await query.graph({
    entity: "shipping_option",
    fields: [
      "id",
      "name",
      "service_zone_id",
      "shipping_profile_id",
      "provider_id",
    ],
    filters: { service_zone_id: serviceZoneId },
  })

  for (const option of SHIPPING_OPTIONS) {
    const legacyName =
      option.code === "pac"
        ? ["PAC", "Standard Brazil Shipping", "Standard Shipping"]
        : ["SEDEX", "Express Brazil Shipping", "Express Shipping"]
    const existingOption = existingOptions.find(
      (existing) =>
        legacyName.includes(existing.name) &&
        existing.shipping_profile_id === shippingProfile.id &&
        existing.provider_id === PROVIDER_ID,
    )

    if (!existingOption) {
      continue
    }

    await updateShippingOptionsWorkflow(container).run({
      input: [
        {
          id: existingOption.id,
          name: option.name,
          price_type: "flat",
          type: {
            label: option.name,
            description:
              option.code === "sedex"
                ? "Entrega por SEDEX."
                : "Entrega pelo PAC.",
            code: option.code,
          },
          prices: [{ currency_code: "brl", amount: BRAZIL_SHIPPING_RATE }],
        },
      ],
    })
  }

  const optionsToCreate = SHIPPING_OPTIONS.filter(
    (option) =>
      !existingOptions.some(
        (existing) =>
          (existing.name === option.name ||
            (option.code === "pac" &&
              existing.name === "Standard Brazil Shipping") ||
            (option.code === "sedex" &&
              existing.name === "Express Brazil Shipping")) &&
          existing.shipping_profile_id === shippingProfile.id &&
          existing.provider_id === PROVIDER_ID,
      ),
  )

  if (optionsToCreate.length) {
    await createShippingOptionsWorkflow(container).run({
      input: optionsToCreate.map((option) => ({
        name: option.name,
        price_type: "flat" as const,
        provider_id: PROVIDER_ID,
        service_zone_id: serviceZoneId,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: option.name,
          description:
            option.code === "sedex"
              ? "Entrega por SEDEX."
              : "Entrega pelo PAC.",
          code: option.code,
        },
        prices: [{ currency_code: "brl", amount: BRAZIL_SHIPPING_RATE }],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq" as const,
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq" as const,
          },
        ],
      })),
    })
  }

  logger.info(
    `Brazilian delivery is configured for "${stockLocation.name}" with ${SHIPPING_OPTIONS.length} shipping option(s) at R$ ${BRAZIL_SHIPPING_RATE.toFixed(2)}.`,
  )
}
