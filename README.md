# ShopShop UI

The web front end for [ShopShop](https://github.com/gurungsh/shopshop): a React single-page app that talks to the ShopShop gateway.

Built with Vite, React 19 and TypeScript (strict).

## Prerequisites

- Node 24 (see `.nvmrc`). With nvm: `nvm use`
- npm 11 or later

## Getting started

```bash
npm install
npm run dev
```

The app runs on http://localhost:5173.

## Scripts

| Script                    | What it does                                         |
| ------------------------- | ---------------------------------------------------- |
| `npm run dev`             | Start the dev server with hot reload                 |
| `npm run build`           | Typecheck, then build for production into `dist/`    |
| `npm run preview`         | Serve the production build locally                   |
| `npm run typecheck`       | Run the TypeScript compiler without emitting files   |
| `npm run lint`            | Run ESLint                                           |
| `npm run lint:css`        | Run Stylelint on the CSS                             |
| `npm run format`          | Format every file with Prettier                      |
| `npm test`                | Run the tests once (Vitest)                          |
| `npm run test:watch`      | Run the tests in watch mode while you work           |
| `npm run storybook`       | Browse the UI components and pages in Storybook      |
| `npm run build-storybook` | Build a static Storybook into `storybook-static/`    |
| `npm run format:check`    | Check formatting without changing files (used by CI) |

## Mock API

The ShopShop gateway is not reachable from this machine, so `npm run dev` serves the API from [MSW](https://mswjs.io) mocks in `src/testing/mocks` (`VITE_API_MOCKING=true` in `.env.development`). API types in `src/api/types` are copied by hand from the backend DTOs; each file names its source. Use a normal browser: embedded browsers that block service workers fall back to the real gateway.

## Payments

Card details go straight from the browser to Stripe; the app only sends the resulting `pm_...` id to the API. `.env.development` sets `VITE_PAYMENT_TEST_METHODS=true`, which swaps the card form for a picker of Stripe's test payment methods (`pm_card_visa`, `pm_card_chargeDeclined`, ...), so no Stripe account is needed. To use the real Stripe card form, create `.env.development.local` (not committed):

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_PAYMENT_TEST_METHODS=false
```

Only the publishable key belongs in the front end. The secret key is set in the backend's Payment service. With the mock API, cards from the Stripe form always succeed; declines need a backend with the matching secret key, or the test picker.

## Project structure

```text
src/
  app/          entry point and app-wide setup
  features/     one folder per feature (catalog, cart, checkout, ...)
  components/   shared UI components
  stores/       client state shared by features (the cart)
  api/          API client and generated types
  lib/          pure helpers
  config/       typed environment config
  styles/       global CSS and design tokens
  testing/      test helpers
```

Folders appear as code is added. Import from `src` with the `@/` alias: `import { App } from '@/app/App'`.

## Roadmap

- [x] **Foundation**: Strict TypeScript build, linting and formatting, git hooks and CI.
- [x] **Catalog browsing**: Browse, filter and search products, and open a product page.
- [x] **Authentication**: Register, sign in and sign out. Protected pages send visitors to sign in and bring them back.
- [x] **Cart**: A cart in the browser that survives reloads and is always priced from the catalog.
- [x] **Checkout and payment**: Enter a shipping address and a card, place the order and see the payment outcome.
- [ ] **Customer orders**: Order history and detail: follow the status, cancel when allowed and retry a failed payment.
- [ ] **Account profile**: See your email and role, and change your email or password.
- [ ] **Admin orders**: Find any order, see who ordered what and move it through its statuses.
- [x] **Admin dashboard**: A landing page for admins with an at-a-glance view of orders.
- [x] **Admin catalog and users**: Manage products, categories and user accounts without Swagger.
- [ ] **Hardening and release**: End-to-end tests, an accessibility pass and a container image, so the app is safe to demo and easy to run.
