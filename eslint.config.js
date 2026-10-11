import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettier from 'eslint-config-prettier/flat'
import boundaries from 'eslint-plugin-boundaries'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Shared layers that features and the app may import
const sharedLayers = ['components', 'api', 'lib', 'config', 'styles']

export default defineConfig([
  globalIgnores(['dist']),

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
        { type: 'api', pattern: 'src/api' },
        { type: 'lib', pattern: 'src/lib' },
        { type: 'config', pattern: 'src/config' },
        { type: 'styles', pattern: 'src/styles' },
        { type: 'testing', pattern: 'src/testing' },
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
              from: { element: { type: 'api' } },
              allow: { to: { element: { type: ['api', 'lib', 'config'] } } },
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
  prettier,
])
