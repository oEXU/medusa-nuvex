<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Product Detail Page Playbook

Trigger: the user asks for "detail de <produto>" / "página de detalhe de X" / "create a product detail page for X".

Default: create a **mock-first** detail page. Do not touch the backend unless the
user explicitly asks for a real Medusa product.

## 1. Collect the spec

Required:

| Field | Notes |
| --- | --- |
| `handle` | URL slug, unique, kebab-case |
| `title` | Product name |
| `description` | One or two sentences |
| `image` | Path already present in `apps/storefront/public/` |
| `price` | Cents, per currency: `{ brl, usd }` |

Optional: `subtitle`, `variantTitle`, `sku`, `originalPrice`.

If any required field is missing, ask the user. Never invent an image path or a
price. Prices are integers in cents (`34999` = R$ 349,99).

## 2. Add the mock

Append an entry to `MOCK_PRODUCTS` in `src/lib/data/mock-products.ts`:

```ts
{
  handle: "the-last-of-us-part-ii",
  title: "The Last of Us Part II",
  subtitle: "PlayStation 5",
  description: "Remastered for PS5.",
  image: "/banner-tlou2.jpg",
  variantTitle: "PS5",
  sku: "TLOU2-PS5",
  price: { brl: 19990, usd: 3999 },
  originalPrice: { brl: 24990, usd: 4999 }, // omit for no discount
}
```

`MOCK_PRODUCTS` is the single source of truth. `getMockProduct(handle, region)`
builds a `StoreProduct` with the region currency and `metadata.mock = true`.

## 3. Routing is already wired

No new route file is needed. These already fall back to the mock registry:

- `src/app/[countryCode]/(main)/products/[handle]/page.tsx` (page + `generateMetadata`)
- `src/app/[countryCode]/(main)/products/[handle]/markdown/route.ts` (`.md` and `Accept: text/markdown`)

## 4. Layout

Reuse `ProductTemplate` (`src/modules/products/templates`). Do not create a
per-product page or a custom layout unless the user explicitly asks for one.
Mock products render with the cart disabled ("Produto de exemplo") because
their variant does not exist in Medusa.

If a custom layout is requested, keep the same data contract (`HttpTypes.StoreProduct`)
and add the variation inside `ProductTemplate` based on `product.handle` or
`product.metadata`, rather than duplicating the route.

## 5. Do not, unless asked

- Create/seed the product in the Medusa backend.
- Add the product to the home hero or catalog.
- Upload or generate images (use an existing file under `public/`).
- Modify `ProductActions`, `ProductTemplate`, or shared components.
- Add a static `products/<handle>/page.tsx` route.

## 6. Validate

From `apps/storefront`:

```bash
npx tsc --noEmit
npx eslint src/lib/data/mock-products.ts "src/app/[countryCode]/(main)/products/[handle]/page.tsx" "src/app/[countryCode]/(main)/products/[handle]/markdown/route.ts" src/modules/products/templates/index.tsx
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/br/products/<handle>
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/us/products/<handle>
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/br/products/<handle>.md
```

All three should return `200`. If the page was already cached (`force-static` +
`revalidate = 60`), restart the dev server or wait for revalidation.

## 7. Expected diff for a mock detail

- `src/lib/data/mock-products.ts` — one new `MOCK_PRODUCTS` entry.
- Nothing else, unless the user asked for layout or backend changes.
