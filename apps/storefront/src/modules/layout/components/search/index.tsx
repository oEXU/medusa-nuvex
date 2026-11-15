"use client"

import { MagnifyingGlass } from "@medusajs/icons"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import type { SearchClient } from "instantsearch.js"
import {
  Configure,
  InstantSearch,
  useHits,
  useInstantSearch,
  useSearchBox,
} from "react-instantsearch"

import useSearchSettled from "@lib/hooks/use-search-settled"
import useToggleState from "@lib/hooks/use-toggle-state"
import { PRODUCT_INDEX_NAME, searchClient } from "@lib/search-client"
import { getStoreLanguage, translate } from "@lib/util/store-locale"
import { Text } from "@modules/common/components/ui"
import SearchDrawer from "./drawer"
import SearchHit, { ProductHit } from "./hit"

const HITS_PER_PAGE = 12
const DEBOUNCE_MS = 250

const SearchPanel = ({ onNavigate }: { onNavigate: () => void }) => {
  const timer = useRef<number | undefined>(undefined)

  const queryHook = useCallback(
    (nextQuery: string, search: (value: string) => void) => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => search(nextQuery), DEBOUNCE_MS)
    },
    []
  )

  const { query, refine } = useSearchBox({ queryHook })
  const { items } = useHits<ProductHit>()
  const { status, error } = useInstantSearch()
  const { isSettled } = useSearchSettled()
  const { countryCode } = useParams<{ countryCode: string }>()
  const isEnglish = getStoreLanguage(countryCode) === "en-US"

  const [inputValue, setInputValue] = useState(query)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const hasInput = Boolean(inputValue.trim())
  const isPending = inputValue.trim() !== query.trim()
  const hasResults = Boolean(query.trim()) && items.length > 0

  return (
    <>
      <div className="flex items-center gap-x-3 border-b border-ui-border-base px-4">
        <MagnifyingGlass className="shrink-0 text-ui-fg-muted" />
        <input
          type="search"
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value)
            refine(event.target.value)
          }}
          placeholder={translate(countryCode, "search")}
          aria-label={translate(countryCode, "search")}
          autoFocus
          className="txt-medium w-full bg-transparent py-4 text-ui-fg-base outline-none placeholder:text-ui-fg-muted"
          data-testid="search-input"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hasInput ? (
          <Text
            className="px-4 py-6 text-center text-ui-fg-muted"
            data-testid="search-empty"
          >
            {isEnglish ? "Type to search games." : "Digite para buscar jogos."}
          </Text>
        ) : status === "error" ? (
          <Text
            className="px-4 py-6 text-center text-ui-fg-error"
            data-testid="search-error"
          >
            {isEnglish
              ? "Could not search games"
              : "Não foi possível buscar jogos"}
            {error?.message ? `: ${error.message}` : "."}
          </Text>
        ) : !isSettled ? (
          <Text
            className="px-4 py-6 text-center text-ui-fg-muted"
            data-testid="search-loading"
          >
            {isEnglish ? "Searching…" : "Buscando…"}
          </Text>
        ) : hasResults ? (
          <ul className="py-2" data-testid="search-results">
            {items.map((hit) => (
              <SearchHit key={hit.objectID} hit={hit} onNavigate={onNavigate} />
            ))}
          </ul>
        ) : isPending || !query.trim() ? (
          <Text
            className="px-4 py-6 text-center text-ui-fg-muted"
            data-testid="search-loading"
          >
            {isEnglish ? "Searching…" : "Buscando…"}
          </Text>
        ) : (
          <Text
            className="px-4 py-6 text-center text-ui-fg-subtle"
            data-testid="search-no-results"
          >
            {isEnglish
              ? `No games found for "${query}"`
              : `Nenhum jogo encontrado para "${query}"`}
          </Text>
        )}
      </div>
    </>
  )
}

const Search = () => {
  const { state: isOpen, open, close } = useToggleState()
  const { countryCode } = useParams<{ countryCode: string }>()

  return (
    <>
      {/* A real link so search works without JavaScript; with JS it opens the drawer instead. */}
      <Link
        href={`/${countryCode}/search`}
        onClick={(event) => {
          event.preventDefault()
          open()
        }}
        aria-label={translate(countryCode, "search")}
        className="flex h-11 min-w-0 items-center justify-between gap-3 rounded-sm bg-white px-4 text-slate-500 shadow-sm transition hover:bg-slate-50"
        data-testid="nav-search-button"
      >
        <span className="truncate text-sm">
          {translate(countryCode, "search")}
        </span>
        <MagnifyingGlass className="h-5 w-5 shrink-0 text-slate-950" />
      </Link>

      <SearchDrawer isOpen={isOpen} close={close}>
        <InstantSearch
          indexName={PRODUCT_INDEX_NAME}
          searchClient={searchClient as unknown as SearchClient}
          future={{ preserveSharedStateOnUnmount: true }}
        >
          <Configure hitsPerPage={HITS_PER_PAGE} />
          <SearchPanel onNavigate={close} />
        </InstantSearch>
      </SearchDrawer>
    </>
  )
}

export default Search
