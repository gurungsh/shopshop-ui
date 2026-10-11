import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.url(),
  /** Serve the API from MSW mocks in the browser instead of the gateway */
  VITE_API_MOCKING: z.stringbool().default(false),
})

const result = envSchema.safeParse(import.meta.env)

if (!result.success) {
  throw new Error(
    `Invalid environment variables. Check your .env files.\n${z.prettifyError(result.error)}`,
  )
}

export const env = result.data
