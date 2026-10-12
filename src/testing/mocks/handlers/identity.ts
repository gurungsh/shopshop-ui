import { delay, http, HttpResponse } from 'msw'

import type {
  AuthResponse,
  CreateUserRequest,
  Credentials,
  UpdateUserRequest,
  UserQuery,
  User,
} from '@/api/types/identity'

import { type MockUser, users } from '../data/identity'
import {
  adminOnly,
  apiUrl,
  errorResponse,
  paginate,
  pagingErrors,
  userIdFrom,
  validationProblem,
} from '../http'

function base64Url(value: object): string {
  return btoa(JSON.stringify(value))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

export function fakeToken(user: MockUser): string {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60
  return [
    base64Url({ alg: 'none', typ: 'JWT' }),
    base64Url({ sub: user.id, email: user.email, role: user.role, exp }),
    'mock-signature',
  ].join('.')
}

function authResponse(user: MockUser): AuthResponse {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    token: fakeToken(user),
  }
}

const normalize = (email: string) => email.trim().toLowerCase()

function toUser(user: MockUser): User {
  return { id: user.id, email: user.email, role: user.role }
}

// Mirrors Identity.Api's AuthEndpoints and AuthService
export const identityHandlers = [
  http.post<never, UserQuery>(
    apiUrl('/api/admin/users/search'),
    async ({ request }) => {
      const denied = adminOnly(request)
      if (denied) return denied
      const { email, role, page, pageSize } = await request.json()
      await delay()

      const errors = pagingErrors(page, pageSize)
      if (Object.keys(errors).length) return validationProblem(errors)

      const matches = users
        .filter(
          (u) =>
            (!email || u.email === normalize(email)) &&
            (!role || u.role === role),
        )
        .map(toUser)
      return HttpResponse.json(paginate(matches, page, pageSize))
    },
  ),

  http.post<never, CreateUserRequest>(
    apiUrl('/api/admin/users'),
    async ({ request }) => {
      const denied = adminOnly(request)
      if (denied) return denied
      const { email, password, role } = await request.json()
      await delay()

      if (users.some((u) => u.email === normalize(email))) {
        return errorResponse(409, 'User with this email already exists.')
      }
      const user: MockUser = {
        id: crypto.randomUUID(),
        email: normalize(email),
        role,
        password,
      }
      users.push(user)
      return HttpResponse.json(toUser(user), { status: 201 })
    },
  ),

  http.put<{ id: string }, UpdateUserRequest>(
    apiUrl('/api/admin/users/:id'),
    async ({ request, params }) => {
      const denied = adminOnly(request)
      if (denied) return denied
      const { email, role } = await request.json()
      await delay()

      const user = users.find((u) => u.id === params.id)
      if (!user) return errorResponse(404, 'User not found.')
      if (users.some((u) => u.id !== user.id && u.email === normalize(email))) {
        return errorResponse(409, 'User with this email already exists.')
      }
      user.email = normalize(email)
      user.role = role
      return HttpResponse.json(toUser(user))
    },
  ),

  http.delete<{ id: string }>(
    apiUrl('/api/admin/users/:id'),
    async ({ request, params }) => {
      const denied = adminOnly(request)
      if (denied) return denied
      await delay()

      const index = users.findIndex((u) => u.id === params.id)
      if (index === -1) return errorResponse(404, 'User not found.')
      users.splice(index, 1)
      return new HttpResponse(null, { status: 204 })
    },
  ),

  http.get<{ id: string }>(
    apiUrl('/api/admin/users/:id'),
    async ({ request, params }) => {
      const caller = users.find((u) => u.id === userIdFrom(request))
      if (!caller) return new HttpResponse(null, { status: 401 })
      if (caller.role !== 'Admin') {
        return new HttpResponse(null, { status: 403 })
      }
      await delay()

      const user = users.find((u) => u.id === params.id)
      if (!user) return errorResponse(404, 'User not found.')
      return HttpResponse.json({
        id: user.id,
        email: user.email,
        role: user.role,
      })
    },
  ),

  http.post<never, Credentials>(
    apiUrl('/api/auth/register'),
    async ({ request }) => {
      const { email, password } = await request.json()
      await delay()

      if (users.some((u) => u.email === normalize(email))) {
        return errorResponse(409, 'User with this email already exists.')
      }

      const user: MockUser = {
        id: crypto.randomUUID(),
        email: normalize(email),
        role: 'Customer',
        password,
      }
      users.push(user)
      return HttpResponse.json(authResponse(user), { status: 201 })
    },
  ),

  http.post<never, Credentials>(
    apiUrl('/api/auth/login'),
    async ({ request }) => {
      const { email, password } = await request.json()
      await delay()

      const user = users.find(
        (u) => u.email === normalize(email) && u.password === password,
      )
      // The backend's 401 has no body
      if (!user) return new HttpResponse(null, { status: 401 })
      return HttpResponse.json(authResponse(user))
    },
  ),

  http.get(apiUrl('/api/users/me'), async ({ request }) => {
    await delay()
    const user = users.find((u) => u.id === userIdFrom(request))
    if (!user) return new HttpResponse(null, { status: 401 })
    return HttpResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
    })
  }),

  http.put<never, Credentials>(apiUrl('/api/users/me'), async ({ request }) => {
    const { email, password } = await request.json()
    await delay()

    const user = users.find((u) => u.id === userIdFrom(request))
    if (!user) return new HttpResponse(null, { status: 401 })

    const normalized = normalize(email)
    if (users.some((u) => u.id !== user.id && u.email === normalized)) {
      return errorResponse(409, 'User with this email already exists.')
    }

    user.email = normalized
    user.password = password
    return HttpResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
    })
  }),
]
