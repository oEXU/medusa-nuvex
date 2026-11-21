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
      <div className="group mx-4 my-3 flex items-center gap-x-3 rounded-xl border border-fuchsia-200 bg-gradient-to-l from-pink-50 via-fuchsia-50 to-white px-4 shadow-sm transition duration-200 focus-within:border-fuchsia-400 focus-within:shadow-[0_0_0_3px_rgba(217,70,239,0.15)]">
        <MagnifyingGlass className="shrink-0 text-fuchsia-700 transition-transform duration-200 group-focus-within:scale-110 motion-reduce:transform-none" />
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
          className="txt-medium w-full bg-transparent py-3 text-ui-fg-base outline-none placeholder:text-ui-fg-muted"
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
        className="group relative flex h-11 min-w-0 items-center justify-between gap-3 overflow-hidden rounded-xl border border-white/80 bg-gradient-to-l from-white via-pink-200 to-purple-400 px-4 text-[#1a103a] shadow-[0_6px_18px_rgba(217,70,239,0.16)] transition-all duration-300 ease-out hover:border-white hover:shadow-[0_10px_26px_rgba(217,70,239,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a103a] motion-reduce:transform-none motion-reduce:transition-none"
        data-testid="nav-search-button"
      >
        <span className="truncate text-sm font-medium">
          {translate(countryCode, "search")}
        </span>
        <MagnifyingGlass className="h-5 w-5 shrink-0 text-[#1a103a] transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none" />
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
