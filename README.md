# ShopShop UI

The web front end for [ShopShop](https://github.com/gurungsh/shopshop): a React 19 + TypeScript single-page app built with Vite that talks to the ShopShop gateway.

## Getting started

Requires Node 24 (`nvm use`) and npm 11+.

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Script               | What it does                                              |
| -------------------- | --------------------------------------------------------- |
| `npm run dev`        | Dev server with hot reload                                |
| `npm run build`      | Typecheck and build into `dist/`                          |
| `npm run check`      | Typecheck, lint, format check and unit tests (as CI does) |
| `npm test`           | Unit tests (Vitest); `test:watch` while you work          |
| `npm run test:e2e`   | End-to-end tests (Playwright, against MSW)                |
| `npm run storybook`  | Browse components and pages in Storybook                  |
| `npm run audit:prod` | Fail on high-severity advisories in production deps       |

## Mock API

`npm run dev` serves the API from [MSW](https://mswjs.io) mocks in `src/testing/mocks` (`VITE_API_MOCKING=true` in `.env.development`). Types in `src/api/types` are copied by hand from the backend DTOs. Use a normal browser, since MSW needs service workers.

## Payments

Card details go straight to Stripe; the API only receives a `pm_...` id. By default a picker of Stripe test payment methods replaces the card form, so no Stripe account is needed. For the real card form, create `.env.development.local`:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_PAYMENT_TEST_METHODS=false
```

Only the publishable key belongs here; the secret key lives in the backend.

## End-to-end tests

```bash
npx playwright install chromium   # once
npm run test:e2e
```

Covers the main customer and admin flows, axe accessibility checks on every route and no sideways scrolling at 375px and 768px. Playwright starts the dev server with mocks and test payment methods.

## Notes

- The Content Security Policy is added at build time and uses `VITE_API_BASE_URL` for the gateway origin, so set it when building.
- Set `VITE_ERROR_REPORT_URL` to post crashes and 5xx errors to a collector; otherwise they are only logged.

## Project structure

```text
src/
  app/          entry point and app-wide setup
  features/     one folder per feature
  components/   shared UI components
  stores/       shared client state (the cart)
  api/          API client and types
  lib/          pure helpers
  config/       typed environment config
  styles/       global CSS and design tokens
  testing/      test helpers and mocks
```

Import from `src` with the `@/` alias, for example `import { App } from '@/app/App'`.

## Roadmap

- [x] **Foundation**: Strict TypeScript build, linting and formatting, git hooks and CI.
- [x] **Catalog browsing**: Browse, filter and search products, and open a product page.
- [x] **Authentication**: Register, sign in and sign out. Protected pages send visitors to sign in and bring them back.
- [x] **Cart**: A cart in the browser that survives reloads and is always priced from the catalog.
- [x] **Checkout and payment**: Enter a shipping address and a card, place the order and see the payment outcome.
- [x] **Customer orders**: Order history and detail: follow the status, cancel when allowed and retry a failed payment.
- [x] **Account profile**: See your email and role, and change your email or password.
- [x] **Admin orders**: Find any order, see who ordered what and move it through its statuses.
- [x] **Admin dashboard**: A landing page for admins with an at-a-glance view of orders.
- [x] **Admin catalog and users**: Manage products, categories and user accounts without Swagger.
- [x] **Hardening**: End-to-end, accessibility and responsive tests, error and offline states, a Content Security Policy and error reporting.
- [ ] **Containerize**: A Dockerfile and a Docker Compose entry, so the app and backend start together.
