"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { getStoreLanguage } from "@lib/util/store-locale"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState("sign-in")
  const { countryCode } = useParams<{ countryCode: string }>()
  const isBrazil = getStoreLanguage(countryCode) === "pt-BR"

  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:grid sm:grid-cols-[0.85fr_1fr]">
      <section className="relative isolate overflow-hidden bg-[#151321] px-6 py-7 text-white sm:flex sm:flex-col sm:justify-between sm:px-8 sm:py-9">
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-20 -z-10 h-56 w-56 rounded-full bg-fuchsia-600/25 blur-3xl"
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
            NuveX Games
          </p>
          <h1 className="mt-8 max-w-sm text-2xl font-semibold leading-tight sm:text-3xl">
            {isBrazil
              ? "Sua próxima aventura começa aqui."
              : "Your next adventure starts here."}
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">
            {isBrazil
              ? "Acesse sua conta para acompanhar pedidos, salvar seus dados e voltar ao jogo."
              : "Sign in to track orders, save your details, and get back to the game."}
          </p>
        </div>
        <p className="mt-8 text-xs text-white/50">
          {isBrazil
            ? "Uma experiência simples, segura e feita para quem joga."
            : "A simple, secure experience made for gamers."}
        </p>
      </section>
      <div className="flex items-center justify-center px-6 py-8 sm:px-10 sm:py-10">
        {currentView === "sign-in" ? (
          <Login setCurrentView={setCurrentView} />
        ) : (
          <Register setCurrentView={setCurrentView} />
        )}
      </div>
    </div>
  )
}

export default LoginTemplate
