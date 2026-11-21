import assert from "node:assert/strict"
import { test } from "node:test"
import { calculateAverageRating } from "./rating.ts"

test("returns zero when there are no ratings", () => {
  assert.equal(calculateAverageRating([]), 0)
})

test("calculates a fractional average", () => {
  assert.equal(calculateAverageRating([5, 4]), 4.5)
})

test("keeps the average within the five-star range", () => {
  assert.equal(calculateAverageRating([7, -1]), 2.5)
})
