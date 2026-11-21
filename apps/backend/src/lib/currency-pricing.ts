export const BRL_PER_USD_RATE = 5.2

export const convertBrlToUsd = (
  brlAmount: number,
  rate = BRL_PER_USD_RATE
) => {
  return Math.round((brlAmount / rate + Number.EPSILON) * 100) / 100
}
