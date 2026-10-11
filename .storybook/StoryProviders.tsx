import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { type InitialEntry, MemoryRouter, Route, Routes } from 'react-router'

export interface RouterParameters {
  path?: string
  url?: InitialEntry
}

export function StoryProviders({
  router = {},
  children,
}: {
  router?: RouterParameters
  children: ReactNode
}) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  )
  const { path = '/', url = '/' } = router

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path={path} element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}
