import type { RouteObject } from 'react-router'

export const authRoutes: RouteObject[] = [
  {
    path: 'login',
    lazy: async () => {
      const { LoginPage } = await import('./LoginPage')
      return { Component: LoginPage }
    },
  },
  {
    path: 'register',
    lazy: async () => {
      const { RegisterPage } = await import('./RegisterPage')
      return { Component: RegisterPage }
    },
  },
]

export const accountRoutes: RouteObject[] = [
  {
    path: 'account/profile',
    lazy: async () => {
      const { ProfilePage } = await import('./ProfilePage')
      return { Component: ProfilePage }
    },
  },
]

/** Children of the /admin route, which already requires an admin */
export const adminUserRoutes: RouteObject[] = [
  {
    path: 'users',
    lazy: async () => {
      const { AdminUsersPage } = await import('./AdminUsersPage')
      return { Component: AdminUsersPage }
    },
  },
  {
    path: 'users/new',
    lazy: async () => {
      const { AdminUserCreatePage } = await import('./AdminUserFormPages')
      return { Component: AdminUserCreatePage }
    },
  },
  {
    path: 'users/:id',
    lazy: async () => {
      const { AdminUserEditPage } = await import('./AdminUserFormPages')
      return { Component: AdminUserEditPage }
    },
  },
]
