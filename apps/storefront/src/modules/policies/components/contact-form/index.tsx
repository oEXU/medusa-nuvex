"use client"

import { FormEvent, useState } from "react"

import { sdk } from "@lib/config"

export default function ContactForm({ isBrazil }: { isBrazil: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const formData = new FormData(event.currentTarget)
    const whatsapp = String(formData.get("whatsapp") ?? "").trim()
    const whatsappDigits = whatsapp.replace(/\D/g, "")

    if (whatsappDigits.length < 10 || whatsappDigits.length > 15) {
      setError(
        isBrazil
          ? "Informe um WhatsApp válido com DDD."
          : "Enter a valid WhatsApp number with country code."
      )
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
          : isBrazil
            ? "Não foi possível enviar sua mensagem agora. Tente novamente."
            : "We could not send your message right now. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900"
      >
        {isBrazil
          ? "Recebemos sua mensagem. Nossa equipe entrará em contato pelo WhatsApp informado."
          : "We received your message. Our team will contact you through the WhatsApp number provided."}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 small:grid-cols-2">
      <label className="flex flex-col gap-2 text-sm font-bold text-[#3f3950]">
        {isBrazil ? "Seu nome" : "Your name"}
        <input
          name="name"
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
          className="h-12 rounded-xl border border-[#ddd7e8] bg-[#faf9fc] px-4 text-sm font-normal outline-none transition focus:border-[#8b5cf6] focus:bg-white focus:ring-4 focus:ring-[#ede9fe]"
          placeholder={isBrazil ? "Como devemos chamar você?" : "How should we address you?"}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-bold text-[#3f3950]">
        WhatsApp
        <input
          name="whatsapp"
          type="tel"
          required
          minLength={10}
          maxLength={25}
          autoComplete="tel"
          className="h-12 rounded-xl border border-[#ddd7e8] bg-[#faf9fc] px-4 text-sm font-normal outline-none transition focus:border-[#8b5cf6] focus:bg-white focus:ring-4 focus:ring-[#ede9fe]"
          placeholder="+55 (11) 99999-9999"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-bold text-[#3f3950] small:col-span-2">
        {isBrazil ? "Como podemos ajudar?" : "How can we help?"}
        <textarea
          name="question"
          required
          minLength={5}
          maxLength={2000}
          rows={5}
          className="resize-y rounded-xl border border-[#ddd7e8] bg-[#faf9fc] px-4 py-3 text-sm font-normal outline-none transition focus:border-[#8b5cf6] focus:bg-white focus:ring-4 focus:ring-[#ede9fe]"
          placeholder={
            isBrazil
              ? "Inclua o número do pedido e explique sua dúvida."
              : "Include your order number and explain your question."
          }
        />
      </label>
      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 small:col-span-2"
        >
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1a103a] px-5 text-sm font-extrabold text-white transition hover:bg-[#35246a] disabled:cursor-not-allowed disabled:opacity-60 small:col-span-2 small:w-fit"
      >
        {isSubmitting
          ? isBrazil
            ? "Enviando..."
            : "Sending..."
          : isBrazil
            ? "Enviar mensagem"
            : "Send message"}
      </button>
    </form>
  )
}
