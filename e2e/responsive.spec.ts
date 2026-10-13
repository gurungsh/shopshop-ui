import { expect, test } from '@playwright/test'

import { openRoute, routes } from './routes'

const viewports = [
  { name: 'phone', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
]

for (const viewport of viewports) {
  test.describe(`${viewport.name} (${String(viewport.width)}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    for (const route of routes) {
      test(`${route.name} does not scroll sideways`, async ({ page }) => {
        await openRoute(page, route)

        const overflow = await page.evaluate(() => {
          const root = document.documentElement
          return root.scrollWidth - root.clientWidth
        })
        expect(overflow).toBeLessThanOrEqual(0)
      })
    }
  })
}
