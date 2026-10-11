import type { Role } from '@/api/types/identity'

export interface MockUser {
  id: string
  email: string
  role: Role
  password: string
}

export const users: MockUser[] = [
  {
    id: 'd0000000-0000-4000-8000-000000000001',
    email: 'alex@example.com',
    role: 'Customer',
    password: 'Shopper1!',
  },
  {
    id: 'd0000000-0000-4000-8000-000000000002',
    email: 'admin@example.com',
    role: 'Admin',
    password: 'Admin123!',
  },
]
