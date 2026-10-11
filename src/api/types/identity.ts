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
