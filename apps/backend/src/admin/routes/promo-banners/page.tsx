import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { Button, Container, Heading } from "@medusajs/ui"
import Medusa from "@medusajs/js-sdk"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { type FormEvent, type ReactNode, useState } from "react"

const sdk = new Medusa({
  baseUrl: "/",
  auth: { type: "session" },
})

const bannerTypes = [
  { value: "promotion", label: "Promoção" },
  { value: "weekly_drop", label: "Drop da semana" },
  { value: "launch", label: "Lançamento" },
  { value: "news", label: "Novidade" },
  { value: "announcement", label: "Comunicado" },
] as const

type BannerType = (typeof bannerTypes)[number]["value"]

type PromoBanner = {
  id: string
  type: BannerType
  title: string
  subtitle: string | null
  image_url: string
  mobile_image_url: string | null
  image_only: boolean
  alt_text: string
  link_url: string | null
  cta_label: string | null
  sort_order: number
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
}

type BannerPayload = Omit<PromoBanner, "id">

const emptyForm: BannerPayload = {
  type: "promotion",
  title: "",
  subtitle: "",
  image_url: "",
  mobile_image_url: "",
  image_only: false,
  alt_text: "",
  link_url: "",
  cta_label: "",
  sort_order: 0,
  is_active: true,
  starts_at: null,
  ends_at: null,
}

const PromoBannersPage = () => {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<PromoBanner | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [actionError, setActionError] = useState("")

  const { data, isLoading, error } = useQuery({
    queryKey: ["promo-banners"],
    queryFn: () =>
      sdk.client.fetch<{ promo_banners: PromoBanner[] }>(
        "/admin/promo-banners"
      ),
  })

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["promo-banners"] })

  const saveBanner = useMutation({
    mutationFn: async (payload: BannerPayload) => {
      if (editing) {
        return sdk.client.fetch(`/admin/promo-banners/${editing.id}`, {
          method: "POST",
          body: payload,
        })
      }

      return sdk.client.fetch("/admin/promo-banners", {
        method: "POST",
        body: payload,
      })
    },
    onSuccess: () => {
      setEditing(null)
      setIsCreating(false)
      setActionError("")
      void refresh()
    },
    onError: (mutationError) => {
      setActionError(mutationError.message)
    },
  })

  const toggleBanner = useMutation({
    mutationFn: (banner: PromoBanner) =>
      sdk.client.fetch(`/admin/promo-banners/${banner.id}`, {
        method: "POST",
        body: { is_active: !banner.is_active },
      }),
    onSuccess: () => void refresh(),
    onError: (mutationError) => setActionError(mutationError.message),
  })

  const deleteBanner = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/promo-banners/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      setActionError("")
      void refresh()
    },
    onError: (mutationError) => setActionError(mutationError.message),
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const optionalText = (key: string) =>
      String(formData.get(key) ?? "").trim() || null
    const optionalDate = (key: string) => {
      const value = optionalText(key)
      return value ? new Date(value).toISOString() : null
    }

    const payload: BannerPayload = {
      type: String(formData.get("type")) as BannerType,
      title: String(formData.get("title") ?? "").trim(),
      subtitle: optionalText("subtitle"),
      image_url: String(formData.get("image_url") ?? "").trim(),
      mobile_image_url: optionalText("mobile_image_url"),
      image_only: formData.get("image_only") === "on",
      alt_text: String(formData.get("alt_text") ?? "").trim(),
      link_url: optionalText("link_url"),
      cta_label: optionalText("cta_label"),
      sort_order: Number(formData.get("sort_order") ?? 0),
      is_active: formData.get("is_active") === "on",
      starts_at: optionalDate("starts_at"),
      ends_at: optionalDate("ends_at"),
    }

    saveBanner.mutate(payload)
  }

  const openEdit = (banner: PromoBanner) => {
    setActionError("")
    setIsCreating(false)
    setEditing(banner)
  }

  const closeForm = () => {
    setEditing(null)
    setIsCreating(false)
    setActionError("")
  }

  const banners = data?.promo_banners ?? []
  const activeCount = banners.filter((banner) => banner.is_active).length

  return (
    <Container className="flex flex-col gap-6 py-6">
      <div className="flex flex-col gap-4 small:flex-row small:items-end small:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle">
            NuveX Games
          </p>
          <Heading level="h1">Banners promocionais</Heading>
          <p className="mt-2 max-w-2xl text-sm text-ui-fg-subtle">
            Cadastre destaques para promoções, drops, lançamentos, novidades e
            comunicados. Os banners ativos aparecem automaticamente na loja.
          </p>
        </div>
        <Button
          onClick={() => {
            setActionError("")
            setEditing(null)
            setIsCreating(true)
          }}
        >
          Novo banner
        </Button>
      </div>

      <div className="grid gap-3 small:grid-cols-3">
        <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-4">
          <p className="text-sm text-ui-fg-subtle">Total de banners</p>
          <p className="mt-1 text-2xl font-semibold">{banners.length}</p>
        </div>
        <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-4">
          <p className="text-sm text-ui-fg-subtle">Ativos</p>
          <p className="mt-1 text-2xl font-semibold">{activeCount}</p>
        </div>
        <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-4">
          <p className="text-sm text-ui-fg-subtle">Exibição</p>
          <p className="mt-1 text-sm font-medium">
            Ordem crescente · rotação automática
          </p>
        </div>
      </div>

      {(isCreating || editing) && (
        <Container className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <Heading level="h2">
              {editing ? "Editar banner" : "Cadastrar banner"}
            </Heading>
            <Button variant="secondary" onClick={closeForm}>
              Fechar
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 medium:grid-cols-2">
            <Field label="Tipo de conteúdo">
              <select
                name="type"
                defaultValue={editing?.type ?? emptyForm.type}
                className="h-10 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm"
              >
                {bannerTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ordem de exibição">
              <input
                name="sort_order"
                type="number"
                min={0}
                defaultValue={editing?.sort_order ?? emptyForm.sort_order}
                className="h-10 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm"
              />
            </Field>
            <Field label="Título interno e título do banner">
              <input
                name="title"
                required
                maxLength={120}
                defaultValue={editing?.title ?? ""}
                className="h-10 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm"
              />
            </Field>
            <Field label="Texto complementar">
              <input
                name="subtitle"
                maxLength={240}
                defaultValue={editing?.subtitle ?? ""}
                className="h-10 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm"
              />
            </Field>
            <Field label="URL da imagem para desktop">
              <input
                name="image_url"
                type="url"
                required
                defaultValue={editing?.image_url ?? ""}
                placeholder="https://..."
                className="h-10 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm"
              />
            </Field>
            <Field label="URL da imagem para celular (opcional)">
              <input
                name="mobile_image_url"
                type="url"
                defaultValue={editing?.mobile_image_url ?? ""}
                placeholder="https://..."
                className="h-10 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm"
              />
            </Field>
            <Field label="Texto alternativo da imagem">
              <input
                name="alt_text"
                required
                maxLength={180}
                defaultValue={editing?.alt_text ?? ""}
                className="h-10 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm"
              />
            </Field>
            <Field label="Link do banner (opcional)">
              <input
                name="link_url"
                defaultValue={editing?.link_url ?? ""}
                placeholder="/br/products/jogo ou https://..."
                className="h-10 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm"
              />
            </Field>
            <Field label="Texto do botão (opcional)">
              <input
                name="cta_label"
                maxLength={40}
                defaultValue={editing?.cta_label ?? ""}
                placeholder="Ver oferta"
                className="h-10 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm"
              />
            </Field>
            <Field label="Início da exibição (opcional)">
              <input
                name="starts_at"
                type="datetime-local"
                defaultValue={toDateInput(editing?.starts_at)}
                className="h-10 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm"
              />
            </Field>
            <Field label="Fim da exibição (opcional)">
              <input
                name="ends_at"
                type="datetime-local"
                defaultValue={toDateInput(editing?.ends_at)}
                className="h-10 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm"
              />
            </Field>
            <label className="flex items-center gap-3 text-sm medium:col-span-2">
              <input
                name="is_active"
                type="checkbox"
                defaultChecked={editing?.is_active ?? true}
                className="h-4 w-4 accent-ui-fg-interactive"
              />
              Banner ativo
            </label>
            <label className="flex items-center gap-3 text-sm medium:col-span-2">
              <input
                name="image_only"
                type="checkbox"
                defaultChecked={editing?.image_only ?? emptyForm.image_only}
                className="h-4 w-4 accent-ui-fg-interactive"
              />
              A imagem já contém textos e botões
            </label>

            {editing?.image_url && (
              <div className="medium:col-span-2">
                <p className="mb-2 text-sm font-medium">Imagem atual</p>
                <img
                  src={editing.image_url}
                  alt={editing.alt_text}
                  className="max-h-48 w-full rounded-lg border border-ui-border-base object-cover"
                />
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-ui-border-base pt-4 medium:col-span-2 xsmall:flex-row xsmall:items-center xsmall:justify-between">
              <p className="max-w-2xl text-xs leading-5 text-ui-fg-subtle">
                Recomendado: desktop 1920 × 600 px (16:5) e celular 1200 × 900
                px (4:3). Use imagens otimizadas em WebP ou AVIF. Sem imagem
                mobile, o banner será recortado automaticamente.
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={closeForm}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={saveBanner.isPending}>
                  Salvar banner
                </Button>
              </div>
            </div>
          </form>
        </Container>
      )}

      {actionError && (
        <p role="alert" className="rounded-md bg-ui-bg-error-subtle p-3 text-sm text-ui-fg-error">
          {actionError}
        </p>
      )}
      {isLoading ? (
        <p className="text-sm text-ui-fg-subtle">Carregando banners...</p>
      ) : error ? (
        <p role="alert" className="text-sm text-ui-fg-error">
          Não foi possível carregar os banners: {error.message}
        </p>
      ) : banners.length === 0 ? (
        <Container className="py-10 text-center">
          <Heading level="h2">Nenhum banner cadastrado</Heading>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            Crie seu primeiro banner para começar a divulgar novidades na loja.
          </p>
        </Container>
      ) : (
        <div className="flex flex-col gap-3">
          {banners.map((banner) => (
            <Container
              key={banner.id}
              className="grid gap-4 small:grid-cols-[220px_1fr_auto] small:items-center"
            >
              <img
                src={banner.image_url}
                alt={banner.alt_text}
                className="h-28 w-full rounded-md bg-ui-bg-subtle object-cover"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Heading level="h3">{banner.title}</Heading>
                  <span className="rounded-full bg-ui-bg-subtle px-2 py-1 text-xs">
                    {bannerTypes.find((type) => type.value === banner.type)?.label}
                  </span>
                  <span
                    className={
                      banner.is_active
                        ? "rounded-full bg-ui-tag-green-bg px-2 py-1 text-xs text-ui-tag-green-text"
                        : "rounded-full bg-ui-bg-subtle px-2 py-1 text-xs text-ui-fg-subtle"
                    }
                  >
                    {banner.is_active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                {banner.subtitle && (
                  <p className="mt-1 truncate text-sm text-ui-fg-subtle">
                    {banner.subtitle}
                  </p>
                )}
                <p className="mt-1 text-xs text-ui-fg-muted">
                  Ordem {banner.sort_order}
                  {banner.starts_at &&
                    ` · Início ${new Date(banner.starts_at).toLocaleString("pt-BR")}`}
                  {banner.ends_at &&
                    ` · Fim ${new Date(banner.ends_at).toLocaleString("pt-BR")}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => openEdit(banner)}
                >
                  Editar
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  isLoading={toggleBanner.isPending}
                  onClick={() => toggleBanner.mutate(banner)}
                >
                  {banner.is_active ? "Desativar" : "Ativar"}
                </Button>
                <Button
                  size="small"
                  variant="danger"
                  isLoading={deleteBanner.isPending}
                  onClick={() => {
                    if (window.confirm(`Excluir o banner "${banner.title}"?`)) {
                      deleteBanner.mutate(banner.id)
                    }
                  }}
                >
                  Excluir
                </Button>
              </div>
            </Container>
          ))}
        </div>
      )}
    </Container>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  )
}

function toDateInput(value?: string | null) {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000
  )
  return localDate.toISOString().slice(0, 16)
}

export const config = defineRouteConfig({
  label: "Banners promocionais",
  icon: ChatBubbleLeftRight,
})

export default PromoBannersPage
