import { z } from 'zod'

export const countries = ['United States', 'Canada', 'United Kingdom'] as const

/** CreateOrderRequestValidator: the joined address is at most 500 characters */
export const MAX_ADDRESS_LENGTH = 500

const required = (what: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter ${what}.`)
    .max(120, 'Keep this under 120 characters.')

const addressFields = z.object({
  fullName: required('your full name'),
  line1: required('a street address'),
  line2: z.string().trim().max(120, 'Keep this under 120 characters.'),
  city: required('a city'),
  region: required('a state or region'),
  postalCode: required('a postal code'),
  country: z.enum(countries, 'Choose a country.'),
})

export type AddressInput = z.input<typeof addressFields>
export type Address = z.output<typeof addressFields>

/** The API takes one string, so the fields are joined line by line (G14) */
export function joinAddress(address: Address): string {
  return [
    address.fullName,
    address.line1,
    address.line2,
    `${address.city}, ${address.region} ${address.postalCode}`,
    address.country,
  ]
    .filter(Boolean)
    .join('\n')
}

export const addressSchema = addressFields.refine(
  (address) => joinAddress(address).length <= MAX_ADDRESS_LENGTH,
  {
    error: 'This address is too long. Shorten it to fit on a shipping label.',
    path: ['line1'],
  },
)

export const emptyAddress: AddressInput = {
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  country: 'United States',
}

const DRAFT_KEY = 'shopshop.checkout.address'

// A draft is half typed, so only its shape is checked
const draftSchema = z
  .object({
    fullName: z.string(),
    line1: z.string(),
    line2: z.string(),
    city: z.string(),
    region: z.string(),
    postalCode: z.string(),
    country: z.enum(countries),
  })
  .partial()

// sessionStorage, like the session: the draft survives a sign in, not the tab
export function loadAddressDraft(): AddressInput {
  try {
    const stored: unknown = JSON.parse(
      sessionStorage.getItem(DRAFT_KEY) ?? 'null',
    )
    const draft = draftSchema.safeParse(stored)
    return draft.success ? { ...emptyAddress, ...draft.data } : emptyAddress
  } catch {
    return emptyAddress
  }
}

export function saveAddressDraft(address: Partial<AddressInput>) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(address))
  } catch {
    // Storage can be full or blocked; the draft is a convenience
  }
}

export function clearAddressDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // As above
  }
}
