import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type { ReactElement } from 'react'
import {
  createMemoryRouter,
  type RouteObject,
  RouterProvider,
} from 'react-router'

interface RenderRouteOptions {
  path?: string
  url?: string
  /** Other routes the page can navigate to */
  routes?: RouteObject[]
}

export function renderRoute(
  element: ReactElement,
  { path = '/', url = '/', routes = [] }: RenderRouteOptions = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const router = createMemoryRouter([{ path, element }, ...routes], {
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
