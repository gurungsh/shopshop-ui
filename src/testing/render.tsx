import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'

interface RenderRouteOptions {
  path?: string
  url?: string
}

export function renderRoute(
  element: ReactElement,
  { path = '/', url = '/' }: RenderRouteOptions = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const router = createMemoryRouter([{ path, element }], {
    initialEntries: [url],
  })
  const user = userEvent.setup()

  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { ...result, user, router }
}
