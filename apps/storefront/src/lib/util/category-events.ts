export const CATEGORY_SELECTED_EVENT = "nuvex:category-selected"

/** Lets the category listings react when a category is picked elsewhere. */
export const notifyCategorySelected = (categoryId: string | null) => {
  window.dispatchEvent(
    new CustomEvent<string | null>(CATEGORY_SELECTED_EVENT, {
      detail: categoryId,
    }),
  )
}

export const subscribeToCategorySelected = (
  handler: (categoryId: string | null) => void,
) => {
  const listener = (event: Event) => {
    const categoryId = (event as CustomEvent<string | null>).detail

    handler(categoryId || null)
  }

  window.addEventListener(CATEGORY_SELECTED_EVENT, listener)

  return () => window.removeEventListener(CATEGORY_SELECTED_EVENT, listener)
}