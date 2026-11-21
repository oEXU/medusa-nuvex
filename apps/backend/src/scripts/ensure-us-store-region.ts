import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  ModuleRegistrationName,
  Modules,
} from "@medusajs/framework/utils"
import {
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  createTaxRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { DEFAULT_REGION_STORE_POLICIES } from "../lib/region-store-policies"

export default async function ensureUsStoreRegion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT,
  )

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "supported_currencies.currency_code", "supported_currencies.is_default"],
  })
  const store = stores[0]

  if (!store) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No store found. Run the initial data seed first.",
    )
  }

  const currencies = (store.supported_currencies ?? []).filter(
    (currency): currency is NonNullable<typeof currency> => currency !== null,
  )
  if (!currencies.some((currency) => currency.currency_code === "usd")) {
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          supported_currencies: [
            ...currencies.map((currency) => ({
              currency_code: currency.currency_code,
              is_default: currency.is_default,
            })),
            { currency_code: "usd", is_default: false },
          ],
        },
      },
    })
  }

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "countries.iso_2"],
  })
  const usRegion = regions.find((region) =>
    region.countries?.some((country) => country?.iso_2 === "us"),
  )

  if (!usRegion) {
    await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "United States",
            currency_code: "usd",
            countries: ["us"],
            payment_providers: ["pp_system_default"],
            metadata: DEFAULT_REGION_STORE_POLICIES,
          },
        ],
      },
    })
    logger.info("Created the United States region with USD pricing.")
  }

  const { data: taxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
  })
  if (!taxRegions.some((region) => region.country_code === "us")) {
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: "us", provider_id: "tp_system" }],
    })
  }

  const { data: fulfillmentSets } = await query.graph({
    entity: "fulfillment_set",
    fields: ["id", "service_zones.geo_zones.country_code"],
  })
  const hasUsZone = fulfillmentSets.some((set) =>
    set.service_zones?.some((zone) =>
      zone.geo_zones?.some((geoZone) => geoZone.country_code === "us"),
    ),
  )

  if (!hasUsZone) {
    const { data: locations } = await query.graph({
      entity: "stock_location",
      fields: ["id"],
    })
    const { data: shippingProfiles } = await query.graph({
      entity: "shipping_profile",
      fields: ["id"],
    })
    const stockLocation = locations[0]
    const shippingProfile = shippingProfiles[0]

    if (!stockLocation || !shippingProfile) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "A stock location and shipping profile are required to configure US delivery.",
      )
    }

    const fulfillmentSet =
      await fulfillmentModuleService.createFulfillmentSets({
        name: "United States delivery",
        type: "shipping",
        service_zones: [
          {
            name: "United States",
            geo_zones: [{ country_code: "us", type: "country" }],
          },
        ],
      })

    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    })

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "PAC",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "PAC",
            description: "Entrega pelo PAC.",
            code: "pac",
          },
          prices: [{ currency_code: "usd", amount: 0 }],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
        {
          name: "SEDEX",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "SEDEX",
            description: "Entrega por SEDEX.",
            code: "sedex",
          },
          prices: [{ currency_code: "usd", amount: 0 }],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    })
    logger.info("Configured the US delivery zone and USD shipping option.")
  }
}
