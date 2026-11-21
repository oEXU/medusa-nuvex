import assert from "node:assert/strict"
import test from "node:test"
import { isDigitalOnlyCart } from "./cart-media.ts"

const gtaDigitalItem = {
  product_handle: "grand-theft-auto-vi-ultimate-edition-primaria",
  requires_shipping: false,
  metadata: { media_type: "digital" },
}

test("regular products require physical delivery even when Medusa flags them as non-shipping", () => {
  assert.equal(
    isDigitalOnlyCart({
      items: [
        {
          product_handle: "console-microsoft-xbox-series-s",
          requires_shipping: false,
        },
      ],
    }),
    false,
  )
})

test("a cart containing only GTA VI digital items is digital-only", () => {
  assert.equal(isDigitalOnlyCart({ items: [gtaDigitalItem] }), true)
})

test("physical GTA VI items and mixed carts are not digital-only", () => {
  assert.equal(
    isDigitalOnlyCart({
      items: [
        {
          product_handle: "grand-theft-auto-vi-ultimate-edition-primaria",
          requires_shipping: true,
          metadata: { media_type: "physical" },
        },
      ],
    }),
    false,
  )
  assert.equal(
    isDigitalOnlyCart({
      items: [
        gtaDigitalItem,
        {
          product_handle: "console-microsoft-xbox-series-s",
          requires_shipping: false,
        },
      ],
    }),
    false,
  )
})
