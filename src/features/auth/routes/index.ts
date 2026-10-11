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
