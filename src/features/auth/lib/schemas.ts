import { z } from 'zod'

// Identity.Api/Validators: ValidationExtensions.cs and LoginRequestValidator.cs.
// Same rules and messages, so the server never rejects what the form accepts.

const email = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .max(256, 'Email must not exceed 256 characters.')
  .pipe(z.email('A valid email address is required.'))

// The backend's exact list; note that ; is not on it
const specialCharacter = /[\^$*+?.()|[\]{}:!@#%&,><'"~`_=\\/-]/

const newPassword = z
  .string()
  .min(1, 'Password is required.')
  .min(8, 'Password must be at least 8 characters long.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')
  .regex(
    specialCharacter,
    'Password must contain at least one special character.',
  )

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required.'),
})

export const registerSchema = z
  .object({
    email,
    password: newPassword,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: 'Passwords don’t match.',
    path: ['confirmPassword'],
  })

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
