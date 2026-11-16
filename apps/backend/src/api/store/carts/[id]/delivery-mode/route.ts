import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  refreshCartShippingMethodsWorkflow,
  updateLineItemInCartWorkflow,
} from "@medusajs/medusa/core-flows";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import { removeCartShippingMethodsWorkflow } from "../../../../../workflows/remove-cart-shipping-methods";
import type { StoreCartDeliveryModeRequest } from "./validators";

type CartItem = {
  id: string;
  metadata?: Record<string, unknown> | null;
  requires_shipping: boolean;
  product?: {
    metadata?: Record<string, unknown> | null;
  } | null;
};

type CartWithItems = {
  items?: CartItem[] | null;
  shipping_methods?: { id: string }[] | null;
};

const hasMediaChoice = (item: CartItem) =>
  item.product?.metadata?.media_fisica_digital === true ||
  item.metadata?.media_type === "physical" ||
  item.metadata?.media_type === "digital";

export async function POST(
  req: MedusaRequest<StoreCartDeliveryModeRequest>,
  res: MedusaResponse,
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data: carts } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "items.id",
      "items.metadata",
      "items.requires_shipping",
      "items.product.metadata",
      "shipping_methods.id",
    ],
    filters: { id: req.params.id },
  });
  const cart = carts[0] as CartWithItems | undefined;
  const items = cart?.items ?? [];

  if (!items.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Cart does not exist or has no items.",
    );
  }

  const { item_id: itemId, media_type: mediaType } = req.validatedBody;
  const itemsToUpdate = itemId
    ? items.filter((item) => item.id === itemId)
    : items.filter(hasMediaChoice);

  if (itemId && !itemsToUpdate.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Cart item ${itemId} was not found.`,
    );
  }

  if (
    (!itemId &&
      mediaType === "digital" &&
      items.some((item) => !hasMediaChoice(item) && item.requires_shipping)) ||
    (itemId && itemsToUpdate.some((item) => !hasMediaChoice(item)))
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Digital delivery is unavailable for one or more items in this cart.",
    );
  }

  if (
    !itemId &&
    mediaType === "physical" &&
    items.some((item) => !hasMediaChoice(item) && !item.requires_shipping)
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Physical delivery is unavailable for one or more items in this cart.",
    );
  }

  for (const item of itemsToUpdate) {
    await updateLineItemInCartWorkflow(req.scope).run({
      input: {
        cart_id: req.params.id,
        item_id: item.id,
        update: {
          requires_shipping: mediaType === "physical",
          metadata: {
            ...item.metadata,
            media_type: mediaType,
          },
        },
      },
    });
  }

  const allItemsNoLongerRequireShipping = items.every((item) =>
    itemsToUpdate.some((updatedItem) => updatedItem.id === item.id)
      ? mediaType === "digital"
      : !item.requires_shipping,
  );

  if (allItemsNoLongerRequireShipping && cart?.shipping_methods?.length) {
    await removeCartShippingMethodsWorkflow(req.scope).run({
      input: {
        shipping_method_ids: cart.shipping_methods.map(({ id }) => id),
      },
    });
  } else {
    await refreshCartShippingMethodsWorkflow(req.scope).run({
      input: { cart_id: req.params.id },
    });
  }

  res.status(200).json({ success: true });
}
