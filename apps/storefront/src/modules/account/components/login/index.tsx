import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"
import { useParams } from "next/navigation"
import { getStoreLanguage } from "@lib/util/store-locale"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const { countryCode } = useParams<{ countryCode: string }>()
  const isBrazil = getStoreLanguage(countryCode) === "pt-BR"

  return (
    <div
      className="flex w-full max-w-sm flex-col items-center"
      data-testid="login-page"
    >
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
        {isBrazil ? "Boas-vindas de volta" : "Welcome back"}
      </h2>
      <p className="mb-7 text-center text-sm leading-6 text-gray-500">
        {isBrazil
          ? "Entre na sua conta para acompanhar seus pedidos e aproveitar sua experiência."
          : "Sign in to track your orders and enjoy a better shopping experience."}
      </p>
      {message?.state === "verification_required" && (
        <div
          className="w-full mb-6 text-center text-base-regular text-ui-fg-base bg-ui-bg-subtle border border-ui-border-base rounded-rounded p-4"
          data-testid="login-verification-message"
        >
          {isBrazil
            ? "Enviamos um link de verificação para"
            : "We sent a verification link to"}{" "}
          <strong>{message.email}</strong>.{" "}
          {isBrazil
            ? "Confirme seu e-mail e entre na conta."
            : "Please verify your email, then sign in."}
        </div>
      )}
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label={isBrazil ? "E-mail" : "Email"}
            name="email"
            type="email"
            title={
              isBrazil
                ? "Digite um endereço de e-mail válido."
                : "Enter a valid email address."
            }
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label={isBrazil ? "Senha" : "Password"}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="login-error-message"
        />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          {isBrazil ? "Entrar" : "Sign in"}
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        {isBrazil ? "Ainda não tem uma conta?" : "Not a member?"}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          {isBrazil ? "Cadastre-se" : "Join us"}
        </button>
      </span>
    </div>
  )
}

export default Login
