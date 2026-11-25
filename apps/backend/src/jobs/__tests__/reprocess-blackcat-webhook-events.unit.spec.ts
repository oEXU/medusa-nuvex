import type { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import reprocessBlackcatWebhookEvents from "../reprocess-blackcat-webhook-events"

describe("reprocess BlackCat webhook events job", () => {
  it("accepts the Medusa container as the scheduled job argument", async () => {
    const eventService = {
      listBlackcatWebhookEvents: jest.fn().mockResolvedValue([]),
    }
    const locking = { execute: jest.fn() }
    const container = {
      resolve: jest.fn((key: string) =>
        key === Modules.LOCKING ? locking : eventService
      ),
    } as unknown as MedusaContainer

    await reprocessBlackcatWebhookEvents(container)

    expect(eventService.listBlackcatWebhookEvents).toHaveBeenCalledTimes(3)
    expect(locking.execute).not.toHaveBeenCalled()
  })
})
