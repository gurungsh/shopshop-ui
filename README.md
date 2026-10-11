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
  api/          API client and generated types
  lib/          pure helpers
  config/       typed environment config
  styles/       global CSS and design tokens
  testing/      test helpers
```

Folders appear as code is added. Import from `src` with the `@/` alias: `import { App } from '@/app/App'`.
