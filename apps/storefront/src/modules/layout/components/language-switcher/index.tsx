"use client"

import { updateRegion } from "@lib/data/cart"
import { getStoreLanguage } from "@lib/util/store-locale"
import { useParams, usePathname } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"

/* Bandeiras vetoriais de alta resolução para evitar o problema de emojis no Windows */
function BrazilFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 720 504"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="720" height="504" fill="#009C3B" />
      <path d="M360 48L662 252L360 456L58 252L360 48Z" fill="#FFDF00" />
      <circle cx="360" cy="252" r="126" fill="#002776" />
      <path
        d="M236 264C270 230 430 200 486 266"
        stroke="#FFFFFF"
        strokeWidth="20"
        strokeLinecap="round"
      />
    </svg>
  )
}

function USAFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 720 504"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="720" height="504" fill="#B22234" />
      <path
        d="M0 38.7h720M0 116.3h720M0 193.8h720M0 271.4h720M0 349h720M0 426.5h720"
        stroke="#FFFFFF"
        strokeWidth="38.7"
      />
      <rect width="288" height="271.4" fill="#3C3B6E" />
      <g fill="#FFFFFF">
        <circle cx="48" cy="45" r="10" />
        <circle cx="96" cy="45" r="10" />
        <circle cx="144" cy="45" r="10" />
        <circle cx="192" cy="45" r="10" />
        <circle cx="240" cy="45" r="10" />
        <circle cx="72" cy="90" r="10" />
        <circle cx="120" cy="90" r="10" />
        <circle cx="168" cy="90" r="10" />
        <circle cx="216" cy="90" r="10" />
        <circle cx="48" cy="135" r="10" />
        <circle cx="96" cy="135" r="10" />
        <circle cx="144" cy="135" r="10" />
        <circle cx="192" cy="135" r="10" />
        <circle cx="240" cy="135" r="10" />
        <circle cx="72" cy="180" r="10" />
        <circle cx="120" cy="180" r="10" />
        <circle cx="168" cy="180" r="10" />
        <circle cx="216" cy="180" r="10" />
        <circle cx="48" cy="225" r="10" />
        <circle cx="96" cy="225" r="10" />
        <circle cx="144" cy="225" r="10" />
        <circle cx="192" cy="225" r="10" />
        <circle cx="240" cy="225" r="10" />
      </g>
    </svg>
  )
}

function GlobeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}

function CheckIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3.5 8.5l3 3 6-6" />
    </svg>
  )
}

const languages = [
  {
    code: "pt-BR" as const,
    countryCode: "br",
    label: "Português",
    nativeRegion: "Brasil",
    currency: "BRL (R$)",
    currencySymbol: "R$",
    short: "PT",
    Flag: BrazilFlag,
  },
  {
    code: "en-US" as const,
    countryCode: "us",
    label: "English",
    nativeRegion: "United States",
    currency: "USD ($)",
    currencySymbol: "$",
    short: "EN",
    Flag: USAFlag,
  },
]

const LanguageSwitcher = () => {
  const params = useParams<{ countryCode: string }>()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const language = getStoreLanguage(params.countryCode)
  const current = languages.find((l) => l.code === language) ?? languages[0]
  const isEn = language === "en-US"

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Atualiza atributo lang do HTML
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const switchLanguage = (lang: (typeof languages)[number]) => {
    if (lang.code === language) {
      setOpen(false)
      return
    }
    setOpen(false)
    startTransition(() =>
      updateRegion(
        lang.countryCode,
        pathname.replace(/^\/[^/]+/, "") || "",
        lang.code
      )
    )
  }

  const CurrentFlag = current.Flag

  return (
    <div ref={ref} className="relative z-50">
      {/* Botão Gatilho / Trigger com design gamer premium */}
      <button
        type="button"
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={isEn ? "Select region and language" : "Selecionar região e idioma"}
        className={`
          group relative flex items-center gap-2 rounded-full px-3 py-1.5
          text-xs font-semibold tracking-wide
          transition-all duration-300 ease-out select-none
          disabled:cursor-wait disabled:opacity-60
          ${
            open
              ? "bg-[#251547] text-white border-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.35)]"
              : "bg-white/[0.05] text-white/90 border-white/15 hover:bg-white/[0.1] hover:border-pink-400/50 hover:text-white hover:shadow-[0_0_15px_rgba(236,72,153,0.25)]"
          }
          border backdrop-blur-md active:scale-[0.98]
        `}
      >
        {/* Bandeira com moldura sutil */}
        <div className="relative shrink-0 overflow-hidden rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.5)] ring-1 ring-white/20">
          <CurrentFlag className="h-3 w-[18px] object-cover" />
        </div>

        {/* Idioma + Moeda */}
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
          <span>{current.short}</span>
          <span className="hidden text-pink-300/80 xsmall:inline">·</span>
          <span className="hidden rounded bg-pink-500/20 px-1 py-0.2 text-[10px] font-mono font-medium text-pink-200 xsmall:inline">
            {current.currencySymbol}
          </span>
        </span>

        {/* Chevron Animado */}
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          fill="none"
          className={`h-3 w-3 shrink-0 text-white/60 transition-transform duration-300 ease-out group-hover:text-pink-300 ${
            open ? "rotate-180 text-pink-300" : ""
          }`}
        >
          <path
            d="M2.5 4.5l3.5 3.5 3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Indicador de carregamento sutil */}
        {isPending && (
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-pink-500" />
          </span>
        )}
      </button>

      {/* Menu Popover Suspenso */}
      {open && (
        <div
          role="listbox"
          aria-label={isEn ? "Select Language and Currency" : "Selecionar Idioma e Moeda"}
          className="
            absolute right-0 top-[calc(100%+10px)] z-50
            w-72 overflow-hidden rounded-2xl
            border border-pink-500/30 bg-[#130b26]/95
            p-2 shadow-[0_24px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(217,70,239,0.18)]
            backdrop-blur-2xl animate-fade-in-top
          "
        >
          {/* Cabeçalho do menu */}
          <div className="flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-pink-300">
            <span className="flex items-center gap-1.5">
              <GlobeIcon className="h-3.5 w-3.5 text-pink-400" />
              {isEn ? "Region & Currency" : "Região & Moeda"}
            </span>
            <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[9px] font-mono text-white/60">
              NuveX
            </span>
          </div>

          <div className="my-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Lista de Opções */}
          <div className="space-y-1.5 p-1">
            {languages.map((lang) => {
              const isActive = lang.code === language
              const FlagComponent = lang.Flag

              return (
                <button
                  key={lang.code}
                  role="option"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => switchLanguage(lang)}
                  className={`
                    group flex w-full items-center gap-3 rounded-xl p-2.5 text-left
                    transition-all duration-200 select-none
                    ${
                      isActive
                        ? "border border-pink-500/40 bg-gradient-to-r from-pink-500/20 via-purple-500/15 to-transparent text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                        : "border border-transparent text-white/70 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                    }
                  `}
                >
                  {/* Bandeira com ring iluminado */}
                  <div
                    className={`relative shrink-0 overflow-hidden rounded-md shadow-md ring-1 ${
                      isActive ? "ring-pink-400" : "ring-white/20"
                    }`}
                  >
                    <FlagComponent className="h-6 w-9 object-cover" />
                  </div>

                  {/* Informações de Idioma e Região */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold tracking-tight">
                        {lang.label}
                      </span>
                      <span className="rounded bg-white/10 px-1 py-0.5 text-[9px] font-black uppercase text-pink-200">
                        {lang.short}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-300/80">
                      {lang.nativeRegion} ·{" "}
                      <span className="font-semibold text-pink-300">
                        {lang.currency}
                      </span>
                    </span>
                  </div>

                  {/* Indicador de Seleção Ativa */}
                  <div className="shrink-0">
                    {isActive ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-pink-400 bg-pink-500/30 text-pink-300 shadow-[0_0_10px_rgba(244,114,182,0.6)]">
                        <CheckIcon className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-white/20 transition group-hover:border-pink-300/60" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="my-1.5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Rodapé informativo sutil */}
          <div className="px-3 py-1.5 text-center text-[10px] leading-tight text-slate-400">
            {isEn
              ? "Catalog & prices automatically adapt to your selected region."
              : "Catálogo e preços adaptados automaticamente à região."}
          </div>
        </div>
      )}

      <span className="sr-only">
        {isPending
          ? isEn
            ? "Updating region..."
            : "Atualizando região..."
          : ""}
      </span>
    </div>
  )
}

export default LanguageSwitcher
