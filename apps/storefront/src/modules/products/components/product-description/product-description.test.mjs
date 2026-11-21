import assert from "node:assert/strict"
import { test } from "node:test"
import { DESCRIPTION_LINE_LIMIT } from "./constants.ts"

test("exports line limit threshold of 13 lines", () => {
  assert.equal(DESCRIPTION_LINE_LIMIT, 13)
})
