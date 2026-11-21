import { convertBrlToUsd } from "../currency-pricing"

describe("convertBrlToUsd", () => {
  it("converts BRL to USD and rounds to cents", () => {
    expect(convertBrlToUsd(371.88)).toBe(71.52)
  })

  it("uses a supplied exchange rate", () => {
    expect(convertBrlToUsd(100, 4)).toBe(25)
  })
})
