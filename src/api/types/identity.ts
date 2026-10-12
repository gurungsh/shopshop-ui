// Roles.cs

export type Role = 'Admin' | 'Customer'

// RegisterRequest and LoginRequest
export interface Credentials {
  email: string
  password: string
}

// AuthResponse, returned by register and login
export interface AuthResponse {
  id: string
  email: string
  role: Role
  token: string
}

// UserResponse, returned by GET and PUT /api/users/me
export type User = Omit<AuthResponse, 'token'>

// UserQuery, the body of POST /api/admin/users/search. The email is an exact match.
export interface UserQuery {
  email?: string
  role?: Role
  page?: number
  pageSize?: number
}

// AdminCreateUserRequest
export interface CreateUserRequest {
  email: string
  password: string
  role: Role
}

// AdminUpdateUserRequest
export interface UpdateUserRequest {
  email: string
  role: Role
}
