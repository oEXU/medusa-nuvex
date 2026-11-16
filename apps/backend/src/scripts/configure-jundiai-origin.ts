import type { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import { updateStockLocationsWorkflow } from "@medusajs/medusa/core-flows";

type StockLocation = {
  id: string;
  name: string;
  address?: {
    address_1?: string | null;
    address_2?: string | null;
    city?: string | null;
    company?: string | null;
    country_code?: string | null;
    phone?: string | null;
    postal_code?: string | null;
    province?: string | null;
  } | null;
};

export default async function configureJundiaiOrigin({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name", "address.*"],
  });
  const mainLocations = (stockLocations as StockLocation[]).filter(
    (location) => location.name === "Main Warehouse",
  );

  if (!mainLocations.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      'No "Main Warehouse" stock location found. Create or select the fulfillment location in the Medusa Admin first.',
    );
  }

  for (const location of mainLocations) {
    await updateStockLocationsWorkflow(container).run({
      input: {
        selector: { id: location.id },
        update: {
          address: {
            address_1: location.address?.address_1 ?? "",
            address_2: location.address?.address_2,
            city: "Jundiaí",
            country_code: "BR",
            phone: location.address?.phone,
            postal_code: location.address?.postal_code,
            province: location.address?.province,
          },
        },
      },
    });
  }

  logger.info(
    `Updated ${mainLocations.length} Main Warehouse stock location(s) to Jundiaí, Brazil.`,
  );

  if (
    mainLocations.some(
      (location) =>
        !location.address?.address_1 || !location.address?.postal_code,
    )
  ) {
    logger.warn(
      "Add the warehouse street address and postal code in the Medusa Admin before arranging carrier pickup.",
    );
  }
}
