/** @type {import('lint-staged').Configuration} */
export default {
  '*.{js,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.css': ['stylelint --fix', 'prettier --write'],
  '*.{json,md,html,yml,yaml}': 'prettier --write',
}
