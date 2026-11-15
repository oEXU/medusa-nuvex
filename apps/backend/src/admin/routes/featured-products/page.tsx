import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { Button, Container, Heading } from "@medusajs/ui"
import Medusa from "@medusajs/js-sdk"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"

const sdk = new Medusa({
  baseUrl: "/",
  auth: { type: "session" },
})

const categories = [
  { key: "categoria-pc-perifericos", label: "PC e Periféricos" },
  { key: "categoria-ps5", label: "PS5" },
  { key: "categoria-xbox", label: "XBOX" },
  { key: "categoria-switch", label: "Nintendo Switch" },
  { key: "categoria-geek", label: "Geek" },
] as const

type CategoryKey = (typeof categories)[number]["key"]

type Product = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  status: string
}

type FeaturedProduct = {
  id: string
  category_key: CategoryKey
  product_id: string
  sort_order: number
  is_active: boolean
}

const FeaturedProductsPage = () => {
  const queryClient = useQueryClient()
  const [categoryKey, setCategoryKey] = useState<CategoryKey>(categories[0].key)
  const [productId, setProductId] = useState("")
  const [search, setSearch] = useState("")
  const [actionError, setActionError] = useState("")

  const productsQuery = useQuery({
    queryKey: ["featured-products-catalog"],
    queryFn: () =>
      sdk.client.fetch<{ products: Product[]; count: number }>(
        "/admin/products",
        {
          query: {
            limit: 100,
            fields: "id,title,handle,thumbnail,status",
          },
        },
      ),
  })

  const featuredQuery = useQuery({
    queryKey: ["featured-products"],
    queryFn: () =>
      sdk.client.fetch<{ featured_products: FeaturedProduct[] }>(
        "/admin/featured-products",
      ),
  })

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["featured-products"] })

  const addFeatured = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/featured-products", {
        method: "POST",
        body: { category_key: categoryKey, product_id: productId },
      }),
    onSuccess: () => {
      setProductId("")
      setActionError("")
      void refresh()
    },
    onError: (error) => setActionError(error.message),
  })

  const removeFeatured = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/featured-products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      setActionError("")
      void refresh()
    },
    onError: (error) => setActionError(error.message),
  })

  const products = productsQuery.data?.products ?? []
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  )
  const categoryFeatured = (featuredQuery.data?.featured_products ?? [])
    .filter((item) => item.category_key === categoryKey)
    .sort((a, b) => a.sort_order - b.sort_order)
  const featuredIds = new Set(categoryFeatured.map((item) => item.product_id))
  const availableProducts = products
    .filter((product) => product.status === "published")
    .filter((product) => !featuredIds.has(product.id))
    .filter((product) =>
      `${product.title} ${product.handle}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
    )

  return (
    <Container className="flex flex-col gap-6 py-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle">
          NuveX Games
        </p>
        <Heading level="h1">Produtos em destaque</Heading>
        <p className="mt-2 max-w-2xl text-sm text-ui-fg-subtle">
          Escolha produtos já cadastrados no catálogo e organize os destaques
          que aparecem em cada categoria da página inicial.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.key}
            size="small"
            variant={categoryKey === category.key ? "primary" : "secondary"}
            onClick={() => {
              setCategoryKey(category.key)
              setProductId("")
              setActionError("")
            }}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {actionError && (
        <p
          role="alert"
          className="rounded-md bg-ui-bg-error-subtle p-3 text-sm text-ui-fg-error"
        >
          {actionError}
        </p>
      )}

      <Container className="flex flex-col gap-4">
        <Heading level="h2">
          Destaques:{" "}
          {categories.find((category) => category.key === categoryKey)?.label}
        </Heading>
        {featuredQuery.isLoading ? (
          <p className="text-sm text-ui-fg-subtle">Carregando destaques...</p>
        ) : featuredQuery.error ? (
          <p role="alert" className="text-sm text-ui-fg-error">
            Não foi possível carregar os destaques:{" "}
            {featuredQuery.error.message}
          </p>
        ) : categoryFeatured.length ? (
          <ul className="flex flex-col gap-3">
            {categoryFeatured.map((item, index) => {
              const product = productById.get(item.product_id)
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-ui-border-base p-3"
                >
                  {product?.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt=""
                      className="h-14 w-14 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-md bg-ui-bg-subtle" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {product?.title ?? "Produto não encontrado"}
                    </p>
                    <p className="truncate text-xs text-ui-fg-subtle">
                      {product ? `/${product.handle}` : item.product_id}
                    </p>
                  </div>
                  <span className="text-xs text-ui-fg-subtle">{index + 1}</span>
                  <Button
                    size="small"
                    variant="danger"
                    isLoading={removeFeatured.isPending}
                    onClick={() => removeFeatured.mutate(item.id)}
                  >
                    Remover
                  </Button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-ui-fg-subtle">
            Ainda não há produtos em destaque nesta categoria.
          </p>
        )}
      </Container>

      <Container className="flex flex-col gap-4">
        <Heading level="h2">Adicionar produto do catálogo</Heading>
        {productsQuery.isLoading ? (
          <p className="text-sm text-ui-fg-subtle">Carregando produtos...</p>
        ) : productsQuery.error ? (
          <p role="alert" className="text-sm text-ui-fg-error">
            Não foi possível carregar os produtos: {productsQuery.error.message}
          </p>
        ) : (
          <>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Buscar produto
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Digite o nome ou identificador do produto"
                className="h-10 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm"
              />
            </label>
            <div className="flex flex-col gap-2 small:flex-row">
              <select
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                className="h-10 min-w-0 flex-1 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm"
              >
                <option value="">Selecione um produto publicado</option>
                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title} · /{product.handle}
                  </option>
                ))}
              </select>
              <Button
                isLoading={addFeatured.isPending}
                disabled={!productId}
                onClick={() => addFeatured.mutate()}
              >
                Adicionar destaque
              </Button>
            </div>
            {!availableProducts.length && (
              <p className="text-xs text-ui-fg-subtle">
                Nenhum produto publicado disponível para adicionar nesta busca.
              </p>
            )}
          </>
        )}
      </Container>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Produtos em destaque",
  icon: ChatBubbleLeftRight,
})

export default FeaturedProductsPage
