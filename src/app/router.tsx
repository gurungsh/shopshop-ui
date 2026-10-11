import { createBrowserRouter } from 'react-router'

import { AuthLayout } from '@/app/layouts/AuthLayout'
import { StorefrontLayout } from '@/app/layouts/StorefrontLayout'
import { AppLoading } from '@/app/routes/AppLoading'
import { NotFoundPage } from '@/app/routes/NotFoundPage'
import { PlaceholderPage } from '@/app/routes/PlaceholderPage'
import { RouteErrorPage } from '@/app/routes/RouteErrorPage'
import { authRoutes, requireAdmin, requireAuth } from '@/features/auth'
import { catalogRoutes } from '@/features/catalog'

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <AppLoading />,
    children: [
      {
        element: <StorefrontLayout />,
        children: [
          ...catalogRoutes,
          {
            loader: requireAuth,
            children: [
              {
                path: 'account/orders',
                element: <PlaceholderPage title="Your orders" chunk="F5" />,
              },
              {
                path: 'account/profile',
                element: <PlaceholderPage title="Profile" chunk="F6" />,
              },
            ],
          },
          {
            path: 'admin',
            loader: requireAdmin,
            element: <PlaceholderPage title="Admin" chunk="F7" />,
          },
        ],
      },
      { element: <AuthLayout />, children: [...authRoutes] },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
