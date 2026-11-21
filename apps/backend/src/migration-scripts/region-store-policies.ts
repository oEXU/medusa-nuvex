import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows";
import { DEFAULT_REGION_STORE_POLICIES } from "../lib/region-store-policies";

export default async function regionStorePolicies({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "metadata"],
  });

  for (const region of regions) {
    const metadata = region.metadata ?? {};
    const missing = Object.fromEntries(
      Object.entries(DEFAULT_REGION_STORE_POLICIES).filter(([key]) => metadata[key] === undefined)
    );
    const updates =
      metadata.shipping_rate === 0
        ? missing
        : { ...missing, shipping_rate: 0 };
    if (!Object.keys(updates).length) {
      continue;
    }

    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: { metadata: { ...metadata, ...updates } },
      },
    });
    logger.info(`Added store policy defaults to region "${region.name}"`);
  }
}
