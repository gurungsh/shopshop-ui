import { createBrowserRouter } from 'react-router'

import { StorefrontLayout } from '@/app/layouts/StorefrontLayout'
import { AppLoading } from '@/app/routes/AppLoading'
import { NotFoundPage } from '@/app/routes/NotFoundPage'
import { RouteErrorPage } from '@/app/routes/RouteErrorPage'
import { catalogRoutes } from '@/features/catalog'

export const router = createBrowserRouter([
  {
    element: <StorefrontLayout />,
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <AppLoading />,
    children: [...catalogRoutes],
  },
  { path: '*', element: <NotFoundPage /> },
])
