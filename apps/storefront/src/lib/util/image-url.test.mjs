import assert from "node:assert/strict"
import test from "node:test"
import { resolveImageUrl } from "./image-url.ts"

test("proxies Medusa static images through the storefront for loopback URLs", () => {
  assert.equal(
    resolveImageUrl("http://localhost:9000/static/product.png?size=large"),
    "/medusa-assets/product.png?size=large",
  )
})

test("converts loopback storefront banner URLs to same-origin paths", () => {
  assert.equal(
    resolveImageUrl("http://127.0.0.1:8000/banner.jpg"),
    "/banner.jpg",
  )
})

test("leaves external and relative image URLs unchanged", () => {
  assert.equal(
    resolveImageUrl("https://cdn.example.com/product.png"),
    "https://cdn.example.com/product.png",
  )
  assert.equal(resolveImageUrl("/product.png"), "/product.png")
})
