# Medusa Local Project

Local Medusa commerce backend and customer-facing Next.js storefront generated from the official Medusa DTC starter.

## Requirements

- Node.js 22.23.4 or newer (this environment uses Node.js 24.22.1)
- PostgreSQL 15 or newer (this environment uses PostgreSQL 17)
- npm, included with Node.js

## Configure PostgreSQL

Create a database named `medusa_apt_gtavi_medusa` owned by the local `admin` database user:

```sql
CREATE ROLE admin WITH LOGIN PASSWORD '<local-database-password>';
CREATE DATABASE medusa_apt_gtavi_medusa OWNER admin;
```

The local Medusa database connection is configured in `apps/backend/.env`:

```dotenv
DATABASE_URL=postgres://admin:<local-database-password>@127.0.0.1:5432/medusa_apt_gtavi_medusa
```

The `.env` file is ignored by Git and should not be committed. The local PostgreSQL administrator password was reset for this setup. Existing databases were left unchanged, but other local applications connecting as `postgres` may need updated credentials.

## Run Medusa

From the project root, run:

```powershell
cd apps/backend
npm run dev
```

The local admin account signs in with the email `admin@example.com` (the Medusa login expects an email, not the username `admin`) and password `admin123`. Open the dashboard at [http://localhost:9000/app](http://localhost:9000/app). The backend API is available at [http://localhost:9000](http://localhost:9000).

## Customer Storefront

Start the backend and storefront in separate terminals from the project root:

```powershell
npm run backend:dev
npm run storefront:dev
```

Open [http://localhost:8000](http://localhost:8000) as a customer. The storefront defaults to Brazil (`/br`) and connects to the local Medusa backend. Its publishable API key and local URLs are stored in the Git-ignored `apps/storefront/.env.local`.

The storefront landing page uses the NuveX Games identity and the provided logo. The starter includes product browsing, product details, cart, customer accounts, and checkout. Sample products currently lack BRL prices, and local payment and Brazilian shipping/tax providers still need to be configured before checkout can be completed.

## Promotional Banners

Manage storefront promotions in the admin dashboard at [http://localhost:9000/app/promo-banners](http://localhost:9000/app/promo-banners). Sign in using the email `admin@example.com` in the Email field (Medusa does not accept the username `admin` in that field) and the configured local password. A NuveX welcome banner is already registered as a starting example; edit or remove it there. Banners support scheduling, ordering, activation, desktop/mobile images, links, and calls to action. Images must be hosted at URLs accessible to the storefront.

Recommended image sizes are 1920 × 600 px (16:5) for desktop and 1200 × 900 px (4:3) for mobile. WebP or AVIF is recommended; the mobile image is optional.
The banner carousel appears on the homepage immediately before the “Categorias para cada estilo” section, with extra vertical spacing, and is not part of the sticky header.

## Featured Products

Manage the product highlights in the admin dashboard at [http://localhost:9000/app/featured-products](http://localhost:9000/app/featured-products). Choose a category, then add or remove published products from the catalog. The homepage retrieves the selected products from the Medusa Store API, so titles, images, links, and prices stay synchronized with the original product records. Each category lists its selected products in the order they were added. Storefront pages revalidate every 60 seconds, so catalog changes can take up to a minute to appear.

## Store Setup

The local store is configured for Brazil: BRL is the default currency, Brazil is the default region, and the default stock location is in Jundiai, SP. EUR and USD remain available, and the original European region and location are preserved.

The default sales channel is still **Default Sales Channel**. A sales channel represents where products are available for sale (for example, the online store or a separate marketplace). For a single storefront, the default channel is appropriate; products must be assigned to it to be available there.

To add USD prices to catalog variants that have BRL prices but no USD price, run `npm exec medusa exec ./src/scripts/backfill-usd-prices.ts` from `apps/backend`. The script preserves existing USD prices and converts missing prices at R$ 5.20 per US$ 1 by default; set `BRL_PER_USD_RATE` to override the rate.

If the Medusa Admin has a Brazilian stock location and shipping fulfillment set but no delivery options for Brazil, run `npm exec medusa exec ./src/scripts/ensure-brazil-delivery.ts` from `apps/backend`. The script safely adds the Brazil service zone, links the enabled manual fulfillment provider, and creates the standard and express options at the starter's configured rate of R$ 25.00. Configure actual shipping rates and tax rules before production.

The starter's sample products currently have EUR and USD prices, but no BRL prices. Add the actual BRL prices before selling those sample products in Brazil.

## Project Structure

```text
apps/
├── backend/      # Medusa API, commerce modules, workflows, and admin dashboard
└── storefront/   # Customer-facing Next.js storefront
```

## Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Medusa create-medusa-app guide](https://docs.medusajs.com/learn/installation)
- [Medusa GitHub repository](https://github.com/medusajs/medusa)
