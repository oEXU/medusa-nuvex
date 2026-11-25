const BLACKCAT_CHECKOUT_ORIGIN = "https://blackcat.squarify.co"

export function getBlackcatCheckoutUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined
  }

  try {
    const url = new URL(value)
    if (
      url.origin !== BLACKCAT_CHECKOUT_ORIGIN ||
      url.username ||
      url.password
    ) {
      return undefined
    }
    return value
  } catch {
    return undefined
  }
}
