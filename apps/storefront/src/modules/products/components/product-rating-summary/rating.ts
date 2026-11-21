export function calculateAverageRating(ratings: number[]) {
  if (!ratings.length) {
    return 0
  }

  const total = ratings.reduce(
    (sum, rating) => sum + Math.min(Math.max(rating, 0), 5),
    0
  )

  return total / ratings.length
}
