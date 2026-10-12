import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.url(),
  /** Serve the API from MSW mocks in the browser instead of the gateway */
  VITE_API_MOCKING: z.stringbool().default(false),
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
  /** Pick a Stripe test payment method (pm_card_visa, ...) instead of entering a card */
  /** Endpoint that receives runtime error reports; none are sent when unset */
  VITE_ERROR_REPORT_URL: z.url().optional(),
  VITE_PAYMENT_TEST_METHODS: z.stringbool().default(false),
})

const result = envSchema.safeParse(import.meta.env)

if (!result.success) {
  throw new Error(
    `Invalid environment variables. Check your .env files.\n${z.prettifyError(result.error)}`,
  )
}

export const env = result.data
