import { z } from "@medusajs/framework/zod";

export const StoreCartDeliveryModeSchema = z.object({
  media_type: z.enum(["physical", "digital"]),
  item_id: z.string().optional(),
});

export type StoreCartDeliveryModeRequest = z.infer<
  typeof StoreCartDeliveryModeSchema
>;
