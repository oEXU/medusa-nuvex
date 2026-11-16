"use client"

import type { PromoBanner } from "@lib/data/promo-banners"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState, useCallback } from "react"

const ROTATION_INTERVAL = 6000

const bannerTypeLabels: Record<PromoBanner["type"], string> = {
  promotion: "Promoção Especial",
  weekly_drop: "Drop Semanal",
  launch: "Grande Lançamento",
  news: "Novidade Gamer",
  announcement: "Destaque Oficial",
}

const PromoBannerCarousel = ({ banners }: { banners: PromoBanner[] }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)

    updatePreference()
    mediaQuery.addEventListener("change", updatePreference)
    return () => mediaQuery.removeEventListener("change", updatePreference)
  }, [])

  const nextSlide = useCallback(() => {
    setActiveIndex((current) => (current + 1) % banners.length)
  }, [banners.length])

  const prevSlide = useCallback(() => {
    setActiveIndex((current) => (current - 1 + banners.length) % banners.length)
  }, [banners.length])

  const goTo = (index: number) => {
    setActiveIndex(index)
  }

  // Rotação automática suave
  useEffect(() => {
    if (banners.length < 2 || isPaused || prefersReducedMotion) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      nextSlide()
    }, ROTATION_INTERVAL)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [banners.length, isPaused, prefersReducedMotion, nextSlide])

  // Suporte a swipe de toque em celulares e tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const minSwipeDistance = 45

    if (distance > minSwipeDistance) {
      nextSlide()
    } else if (distance < -minSwipeDistance) {
      prevSlide()
    }
  }

  if (!banners.length) {
    return null
  }

  return (
    <section
      aria-label="Destaques e Banners da NuveX"
      aria-roledescription="carrossel"
      className="relative px-4 py-8 sm:px-6 sm:py-12 small:px-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false)
        }
      }}
    >
      <div className="relative mx-auto max-w-7xl">
        {/* Glow de ambiente holográfico atrás do carrossel */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-pink-600/25 via-purple-600/20 to-cyan-500/25 blur-2xl opacity-60 -z-10"
        />

        {/* Card do Carrossel com Altura e Proporções 100% Responsivas */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="group relative h-[250px] xs:h-[300px] sm:h-[380px] md:h-[450px] lg:h-[490px] xl:h-[520px] w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0b0818] shadow-[0_24px_60px_rgba(0,0,0,0.85)] ring-1 ring-white/10"
        >
          {/* Trilho de slides com transição ultra fluida */}
          <div
            className="flex h-full w-full"
            style={{
              transform: `translateX(-${activeIndex * 100}%)`,
              transition: prefersReducedMotion
                ? "none"
                : "transform 650ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {banners.map((banner, index) => {
              const isActive = index === activeIndex
              const isClickable = Boolean(banner.link_url)

              const ContentWrapper = isClickable ? Link : "div"
              const wrapperProps = isClickable
                ? {
                    href: banner.link_url as string,
                    tabIndex: isActive ? 0 : -1,
                    className: "relative h-full w-full block group/slide cursor-pointer",
                  }
                : {
                    className: "relative h-full w-full block group/slide",
                  }

              return (
                <article
                  key={banner.id}
                  aria-hidden={!isActive}
                  aria-roledescription="slide"
                  aria-label={`${index + 1} de ${banners.length}: ${banner.title}`}
                  className="relative h-full w-full shrink-0 overflow-hidden"
                >
                  {/* @ts-expect-error The selected wrapper receives different props for Link and div. */}
                  <ContentWrapper {...wrapperProps}>
                    {/* Imagem do Banner - Desktop e Padrão */}
                    <div className="absolute inset-0 h-full w-full overflow-hidden">
                      <Image
                        src={banner.image_url}
                        alt={banner.alt_text || banner.title}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1280px"
                        priority={index === 0}
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover/slide:scale-[1.02]"
                      />

                      {/* Imagem Mobile Opcional dedicada se houver */}
                      {banner.mobile_image_url && (
                        <picture className="pointer-events-none absolute inset-0 sm:hidden">
                          <source
                            media="(max-width: 639px)"
                            srcSet={banner.mobile_image_url}
                          />
                          <img
                            src={banner.mobile_image_url}
                            alt=""
                            aria-hidden="true"
                            className="h-full w-full object-cover object-center"
                          />
                        </picture>
                      )}
                    </div>

                    {!banner.image_only && (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-[#090614]/90 via-[#090614]/40 to-transparent sm:bg-gradient-to-r sm:from-[#090614]/85 sm:via-[#090614]/30 sm:to-transparent"
                      />
                    )}

                    {/* Borda interna com brilho sutil ao passar o cursor */}
                    {!banner.image_only && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl border border-white/0 transition-colors duration-300 group-hover/slide:border-pink-500/30"
                      />
                    )}

                    {/* Conteúdo textual e Call-To-Action */}
                    {!banner.image_only && (
                      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start justify-end p-5 text-white sm:inset-y-0 sm:left-0 sm:max-w-[62%] sm:justify-center sm:p-10 md:p-14">
                        {/* Badge Neon de Categoria */}
                        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-pink-400/40 bg-pink-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-pink-200 backdrop-blur-md shadow-[0_0_12px_rgba(236,72,153,0.35)] sm:mb-3 sm:text-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-pulse" />
                          {bannerTypeLabels[banner.type]}
                        </span>

                        {/* Título de Impacto com Sombra de Alta Legibilidade */}
                        <h2 className="line-clamp-2 text-xl font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] xs:text-2xl sm:text-4xl md:text-5xl">
                          {banner.title}
                        </h2>

                        {/* Subtítulo Discreto e Elegante */}
                        {banner.subtitle && (
                          <p className="mt-1.5 line-clamp-2 max-w-lg text-xs leading-relaxed text-slate-200/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] sm:mt-3 sm:text-sm md:text-base">
                            {banner.subtitle}
                          </p>
                        )}

                        {/* Botão de Ação / CTA estilizado */}
                        {banner.link_url && (
                          <div className="mt-3.5 sm:mt-6">
                            <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(236,72,153,0.45)] transition-all duration-300 group-hover/slide:shadow-[0_0_30px_rgba(236,72,153,0.7)] group-hover/slide:scale-[1.03] sm:px-6 sm:py-3 sm:text-sm">
                              {banner.cta_label || "Conferir"}
                              <ArrowIcon direction="right" className="h-4 w-4" />
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </ContentWrapper>
                </article>
              )
            })}
          </div>

          {/* Controles de Navegação (Setas Flutuantes Gamer com Glassmorphism) */}
          {banners.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Banner anterior"
                onClick={(e) => {
                  e.stopPropagation()
                  prevSlide()
                }}
                className="absolute left-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#120a26]/75 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-pink-400 hover:bg-[#1f103d] hover:text-pink-300 hover:shadow-[0_0_18px_rgba(236,72,153,0.5)] active:scale-95 sm:left-5 sm:h-12 sm:w-12 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <ArrowIcon direction="left" className="h-5 w-5" />
              </button>

              <button
                type="button"
                aria-label="Próximo banner"
                onClick={(e) => {
                  e.stopPropagation()
                  nextSlide()
                }}
                className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#120a26]/75 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-pink-400 hover:bg-[#1f103d] hover:text-pink-300 hover:shadow-[0_0_18px_rgba(236,72,153,0.5)] active:scale-95 sm:right-5 sm:h-12 sm:w-12 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <ArrowIcon direction="right" className="h-5 w-5" />
              </button>

              {/* Indicadores Dinâmicos de Slide (Pills com Progresso Neon) */}
              <div className="absolute bottom-3.5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 backdrop-blur-md sm:bottom-5">
                {banners.map((banner, index) => {
                  const isCurrent = index === activeIndex
                  return (
                    <button
                      key={banner.id}
                      type="button"
                      aria-label={`Ir para banner ${index + 1}: ${banner.title}`}
                      aria-current={isCurrent}
                      onClick={(e) => {
                        e.stopPropagation()
                        goTo(index)
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCurrent
                          ? "w-8 sm:w-10 bg-gradient-to-r from-pink-400 via-fuchsia-400 to-cyan-400 shadow-[0_0_10px_rgba(244,114,182,0.8)]"
                          : "w-2.5 bg-white/40 hover:bg-white/80"
                      }`}
                    />
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function ArrowIcon({
  direction,
  className = "h-5 w-5",
}: {
  direction: "left" | "right"
  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default PromoBannerCarousel
