"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { getStoreLanguage } from "@lib/util/store-locale"
import { useParams } from "next/navigation"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const { countryCode } = useParams<{ countryCode: string }>()
  const isBrazil = getStoreLanguage(countryCode) === "pt-BR"

  return (
    <div
      className="flex w-full max-w-sm flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
        {isBrazil ? "Crie sua conta" : "Create your account"}
      </h1>
      <p className="mb-6 text-center text-sm leading-6 text-gray-500">
        {isBrazil
          ? "Tenha seus pedidos, endereços e dados sempre à mão."
          : "Keep your orders, addresses, and details all in one place."}
      </p>
      {message?.state === "verification_required" && (
        <div
          className="w-full mb-4 text-center text-base-regular text-ui-fg-base bg-ui-bg-subtle border border-ui-border-base rounded-rounded p-4"
          data-testid="register-verification-message"
        >
          {isBrazil
            ? "Enviamos um link de verificação para"
            : "We sent a verification link to"}{" "}
          <strong>{message.email}</strong>.{" "}
          {isBrazil
            ? "Confira sua caixa de entrada para confirmar o e-mail."
            : "Check your inbox to verify your email, then sign in."}
        </div>
      )}
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label={isBrazil ? "Nome" : "First name"}
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label={isBrazil ? "Sobrenome" : "Last name"}
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label={isBrazil ? "E-mail" : "Email"}
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label={isBrazil ? "Telefone" : "Phone"}
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label={isBrazil ? "Senha" : "Password"}
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="register-error"
        />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          {isBrazil
            ? "Ao criar uma conta, você concorda com a"
            : "By creating an account, you agree to NuveX Games'"}{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            {isBrazil ? "Política de Privacidade" : "Privacy Policy"}
          </LocalizedClientLink>{" "}
          {isBrazil ? "e os" : "and"}{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            {isBrazil ? "Termos de Uso" : "Terms of Use"}
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          {isBrazil ? "Criar conta" : "Join"}
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        {isBrazil ? "Já tem uma conta?" : "Already a member?"}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          {isBrazil ? "Entrar" : "Sign in"}
        </button>
      </span>
    </div>
  )
}

export default Register
