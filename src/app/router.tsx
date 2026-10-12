import { createBrowserRouter } from 'react-router'

import { AdminLayout } from '@/app/layouts/AdminLayout'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { StorefrontLayout } from '@/app/layouts/StorefrontLayout'
import { AppLoading } from '@/app/routes/AppLoading'
import { NotFoundPage } from '@/app/routes/NotFoundPage'
import { PlaceholderPage } from '@/app/routes/PlaceholderPage'
import { RouteErrorPage } from '@/app/routes/RouteErrorPage'
import {
  accountRoutes,
  adminUserRoutes,
  authRoutes,
  requireAdmin,
  requireAuth,
} from '@/features/auth'
import { cartRoutes, checkoutRoutes } from '@/features/cart'
import { adminCatalogRoutes, catalogRoutes } from '@/features/catalog'
import {
  adminDashboardRoutes,
  adminOrderRoutes,
  orderRoutes,
} from '@/features/orders'

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <AppLoading />,
    children: [
      {
        element: <StorefrontLayout />,
        children: [
          ...catalogRoutes,
          ...cartRoutes,
          {
            loader: requireAuth,
            children: [
              ...checkoutRoutes,
              ...orderRoutes,
              ...accountRoutes,
              {
                path: 'account/profile',
                element: <PlaceholderPage title="Profile" chunk="F6" />,
              },
            ],
          },
        ],
      },
      { element: <AuthLayout />, children: [...authRoutes] },
      {
        path: 'admin',
        loader: requireAdmin,
        element: <AdminLayout />,
        children: [
          ...adminDashboardRoutes,
          ...adminOrderRoutes,
          ...adminCatalogRoutes,
          ...adminUserRoutes,
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
