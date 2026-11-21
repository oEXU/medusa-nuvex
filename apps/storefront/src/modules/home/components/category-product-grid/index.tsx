"use client"

import { useEffect, useState } from "react"

import type { HttpTypes } from "@medusajs/types"
import FeaturedCategoryProduct from "@modules/home/components/featured-category-product"

const PAGE_WINDOW_SIZE = 10

function getColumnCount() {
  if (window.matchMedia("(min-width: 1440px)").matches) {
    return 4
  }

  if (window.matchMedia("(min-width: 1280px)").matches) {
    return 3
  }

  return 2
}

export default function CategoryProductGrid({
  products,
  categoryId,
  countryCode,
}: {
  products: HttpTypes.StoreProduct[]
  categoryId: string
  countryCode: string
}) {
  const [columnCount, setColumnCount] = useState(2)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const mediumScreen = window.matchMedia("(min-width: 1280px)")
    const largeScreen = window.matchMedia("(min-width: 1440px)")
    const updateColumnCount = () => setColumnCount(getColumnCount())

    updateColumnCount()
    mediumScreen.addEventListener("change", updateColumnCount)
    largeScreen.addEventListener("change", updateColumnCount)

    return () => {
      mediumScreen.removeEventListener("change", updateColumnCount)
      largeScreen.removeEventListener("change", updateColumnCount)
    }
  }, [])

  const productsPerPage = columnCount * 2
  const totalPages = Math.ceil(products.length / productsPerPage)
  const page = Math.min(currentPage, Math.max(totalPages, 1))
  const pageProducts = products.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  )
  const firstPageInWindow =
    Math.floor((page - 1) / PAGE_WINDOW_SIZE) * PAGE_WINDOW_SIZE + 1
  const lastPageInWindow = Math.min(
    firstPageInWindow + PAGE_WINDOW_SIZE - 1,
    totalPages
  )
  const pages = Array.from(
    { length: lastPageInWindow - firstPageInWindow + 1 },
    (_, index) => firstPageInWindow + index
  )
  const isEnglish = countryCode === "us"

  const goToPage = (nextPage: number) => {
    setCurrentPage(nextPage)
  }

  return (
    <>
      <ul
        id={`${categoryId}-products`}
        className="grid grid-cols-2 gap-3 small:grid-cols-2 medium:grid-cols-3 large:grid-cols-4"
      >
        {pageProducts.map((product) => (
          <FeaturedCategoryProduct key={product.id} product={product} />
        ))}
      </ul>
      {totalPages > 1 && (
        <nav
          aria-label={isEnglish ? "Category pages" : "Páginas da categoria"}
          className="mt-7 flex justify-center"
        >
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#0e1018] px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.28)] small:gap-2 small:px-5">
            {page > 1 && (
              <button
                type="button"
                aria-label={isEnglish ? "Previous page" : "Página anterior"}
                onClick={() => goToPage(page - 1)}
                className="inline-flex h-9 items-center justify-center px-2 text-sm font-medium text-pink-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
              >
                <span aria-hidden="true">‹</span>
              </button>
            )}
            {pages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                disabled={pageNumber === page}
                aria-current={pageNumber === page ? "page" : undefined}
                aria-label={
                  isEnglish ? `Page ${pageNumber}` : `Página ${pageNumber}`
                }
                onClick={() => goToPage(pageNumber)}
                className={`inline-flex h-9 min-w-7 items-center justify-center px-1 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 small:min-w-8 ${
                  pageNumber === page
                    ? "text-pink-300"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {pageNumber}
              </button>
            ))}
            {page < totalPages && (
              <button
                type="button"
                aria-label={isEnglish ? "Next page" : "Mais páginas"}
                onClick={() => goToPage(page + 1)}
                className="inline-flex h-9 items-center gap-1 px-2 text-sm font-semibold text-pink-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
              >
                <span className="hidden small:inline">
                  {isEnglish ? "Next" : "Mais"}
                </span>
                <span aria-hidden="true">›</span>
              </button>
            )}
          </div>
        </nav>
      )}
    </>
  )
}
