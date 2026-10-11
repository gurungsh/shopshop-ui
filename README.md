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
- [ ] **Checkout and payment**: Enter a shipping address and a card, place the order and see the payment outcome.
- [ ] **Customer orders**: Order history and detail: follow the status, cancel when allowed and retry a failed payment.
- [ ] **Account profile**: See your email and role, and change your email or password.
- [ ] **Admin orders**: Find any order, see who ordered what and move it through its statuses.
- [ ] **Admin dashboard**: A landing page for admins with an at-a-glance view of orders.
- [ ] **Admin catalog and users**: Manage products, categories and user accounts without Swagger.
- [ ] **Hardening and release**: End-to-end tests, an accessibility pass and a container image, so the app is safe to demo and easy to run.
