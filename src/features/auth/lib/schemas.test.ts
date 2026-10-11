import { describe, expect, it } from 'vitest'

import { loginSchema, registerSchema } from './schemas'

function firstRegisterError(password: string, confirmPassword = password) {
  const result = registerSchema.safeParse({
    email: 'alex@example.com',
    password,
    confirmPassword,
  })
  return result.error?.issues[0]?.message
}

describe('registerSchema', () => {
  it('accepts a password that meets every backend rule', () => {
    expect(firstRegisterError('Shopper1!')).toBeUndefined()
  })

  it.each([
    ['', 'Password is required.'],
    ['Ab1!', 'Password must be at least 8 characters long.'],
    ['shopper1!', 'Password must contain at least one uppercase letter.'],
    ['SHOPPER1!', 'Password must contain at least one lowercase letter.'],
    ['Shopper!!', 'Password must contain at least one number.'],
    ['Shopper11', 'Password must contain at least one special character.'],
    ['Shopper1;', 'Password must contain at least one special character.'],
  ])('rejects %j: %s', (password, message) => {
    expect(firstRegisterError(password)).toBe(message)
  })

  it('reports mismatched passwords on the confirm field', () => {
    const result = registerSchema.safeParse({
      email: 'alex@example.com',
      password: 'Shopper1!',
      confirmPassword: 'Shopper2!',
    })

    expect(result.error?.issues).toEqual([
      expect.objectContaining({
        path: ['confirmPassword'],
        message: 'Passwords don’t match.',
      }),
    ])
  })
})

describe('loginSchema', () => {
  it.each([
    ['', 'Email is required.'],
    ['alex@', 'A valid email address is required.'],
  ])('rejects the email %j', (email, message) => {
    const result = loginSchema.safeParse({ email, password: 'x' })
    expect(result.error?.issues[0]?.message).toBe(message)
  })

  it('trims the email', () => {
    const result = loginSchema.parse({
      email: '  alex@example.com ',
      password: 'x',
    })
    expect(result.email).toBe('alex@example.com')
  })
})
