"use client"

import { sdk } from "@lib/config"
import Image from "next/image"
import { FormEvent, useState } from "react"

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const formData = new FormData(event.currentTarget)
    const whatsapp = String(formData.get("whatsapp") ?? "").trim()
    const whatsappDigits = whatsapp.replace(/\D/g, "")

    if (whatsappDigits.length < 10 || whatsappDigits.length > 15) {
      setError("Informe um WhatsApp válido com DDD e entre 10 e 15 dígitos.")
      return
    }

    setIsSubmitting(true)

    try {
      await sdk.client.fetch("/store/support-tickets", {
        method: "POST",
        body: {
          name: String(formData.get("name") ?? "").trim(),
          whatsapp,
          question: String(formData.get("question") ?? "").trim(),
        },
      })
      setSubmitted(true)
    } catch (submitError) {
      setError(
        submitError instanceof Error &&
          submitError.message !== "An unknown error occurred."
          ? submitError.message
          : "Não foi possível enviar sua dúvida agora. Verifique seus dados e tente novamente."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-3">
      {isOpen && (
        <section
          role="dialog"
          aria-labelledby="support-widget-title"
          className="w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-black bg-white text-black shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
        >
          <div className="flex items-start justify-between gap-4 bg-black p-5 text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-300">
                Suporte Online 24/7
              </p>
              <h2
                id="support-widget-title"
                className="mt-1 text-lg font-bold"
              >
                Como podemos ajudar?
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar suporte"
              className="rounded-full p-1 text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
              >
                <path
                  d="m6 6 12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="p-5">
            {submitted ? (
              <p
                role="status"
                className="rounded-xl border border-gray-300 bg-gray-100 p-4 text-sm leading-6 text-black"
              >
                Recebemos sua dúvida! Em breve nossa equipe de suporte chamará
                você pelo WhatsApp.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Nome
                  <input
                    name="name"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    className="h-11 rounded-lg border border-gray-400 bg-white px-3 text-black outline-none placeholder:text-gray-500 focus:border-black"
                    placeholder="Seu nome"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  WhatsApp
                  <input
                    name="whatsapp"
                    type="tel"
                    required
                    minLength={10}
                    maxLength={25}
                    autoComplete="tel"
                    className="h-11 rounded-lg border border-gray-400 bg-white px-3 text-black outline-none placeholder:text-gray-500 focus:border-black"
                    placeholder="+55 (11) 99999-9999"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Sua dúvida
                  <textarea
                    name="question"
                    required
                    minLength={5}
                    maxLength={2000}
                    rows={4}
                    className="resize-y rounded-lg border border-gray-400 bg-white px-3 py-2 text-black outline-none placeholder:text-gray-500 focus:border-black"
                    placeholder="Conte como podemos ajudar"
                  />
                </label>
                {error && (
                  <p
                    role="alert"
                    className="rounded-lg border border-black bg-gray-100 p-3 text-sm text-black"
                  >
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Enviando..." : "Enviar dúvida"}
                </button>
                <p className="text-center text-xs leading-5 text-gray-600">
                  Nossa equipe entrará em contato pelo WhatsApp.
                </p>
              </form>
            )}
          </div>
        </section>
      )}

      <div className="flex items-end gap-2">
        {!isOpen && (
          <span className="mb-2 inline-flex items-center rounded-full bg-black px-3 py-2 text-xs font-bold text-white shadow-lg">
            <span
              aria-hidden="true"
              className="relative mr-2 flex h-2 w-2 shrink-0"
            >
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Suporte Online 24/7
          </span>
        )}
        <button
          type="button"
          aria-label={isOpen ? "Fechar suporte" : "Abrir suporte"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-transparent transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          {isOpen ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
            >
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <Image
              src="/whatsapp-support-icon.png"
              alt=""
              width={768}
              height={770}
              sizes="64px"
              className="h-full w-full object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.25)]"
            />
          )}
        </button>
      </div>
    </div>
  )
}

export default SupportWidget
