import { removeShippingMethodFromCartStep } from "@medusajs/medusa/core-flows";
import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

type RemoveCartShippingMethodsInput = {
  shipping_method_ids: string[];
};

export const removeCartShippingMethodsWorkflow = createWorkflow(
  "remove-cart-shipping-methods",
  (input: RemoveCartShippingMethodsInput) => {
    removeShippingMethodFromCartStep({
      shipping_method_ids: input.shipping_method_ids,
    });

    return new WorkflowResponse(undefined);
  },
);
