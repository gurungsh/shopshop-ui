import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettier from 'eslint-config-prettier/flat'
import boundaries from 'eslint-plugin-boundaries'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import storybook from 'eslint-plugin-storybook'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Shared layers that features and the app may import
const sharedLayers = ['components', 'stores', 'api', 'lib', 'config', 'styles']

export default defineConfig([
  globalIgnores([
    'dist',
    'storybook-static',
    'playwright-report',
    'test-results',
  ]),

  {
    files: ['**/*.{js,ts,tsx}'],
    extends: [js.configs.recommended],
  },

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
      pluginQuery.configs['flat/recommended'],
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Route loaders throw responses on purpose; React Router catches them
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [
            { from: 'lib', name: 'Response' },
            {
              from: 'package',
              package: 'react-router',
              name: 'DataWithResponseInit',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: { alwaysTryTypes: true } },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'feature', pattern: 'src/features/*', capture: ['feature'] },
        { type: 'components', pattern: 'src/components' },
        { type: 'stores', pattern: 'src/stores' },
        { type: 'api', pattern: 'src/api' },
        { type: 'lib', pattern: 'src/lib' },
        { type: 'config', pattern: 'src/config' },
        { type: 'styles', pattern: 'src/styles' },
        { type: 'testing', pattern: 'src/testing' },
      ],
      'boundaries/files': [
        { category: 'test', pattern: '**/*.{test,stories}.{ts,tsx}' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'app' } },
              allow: {
                to: [
                  { element: { type: 'app' } },
                  { element: { type: 'testing' } },
                  {
                    element: { type: 'feature', fileInternalPath: 'index.ts' },
                  },
                  { element: { type: sharedLayers } },
                ],
              },
            },
            {
              from: { element: { type: 'feature' } },
              allow: {
                to: [
                  {
                    element: {
                      type: 'feature',
                      captured: {
                        feature: '{{from.element.captured.feature}}',
                      },
                    },
                  },
                  { element: { type: sharedLayers } },
                ],
              },
            },
            {
              from: { element: { type: 'components' } },
              allow: {
                to: {
                  element: { type: ['components', 'lib', 'config', 'styles'] },
                },
              },
            },
            {
              from: { element: { type: 'stores' } },
              allow: { to: { element: { type: ['stores', 'lib', 'config'] } } },
            },
            {
              from: { element: { type: 'api' } },
              allow: { to: { element: { type: ['api', 'lib', 'config'] } } },
            },
            {
              from: { file: { categories: 'test' } },
              allow: { to: { element: { type: 'testing' } } },
            },
            {
              from: { element: { type: 'testing' } },
              allow: {
                to: { element: { type: ['testing', 'api', 'lib', 'config'] } },
              },
            },
            {
              from: { element: { type: ['lib', 'config', 'styles'] } },
              allow: { to: { element: { type: '{{from.element.type}}' } } },
            },
          ],
        },
      ],
    },
  },
  storybook.configs['flat/recommended'],

  prettier,
])
