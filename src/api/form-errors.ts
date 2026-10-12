import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'

import { ApiError } from './errors'

const GENERIC = 'Something went wrong. Try again in a moment.'

interface Options<T extends FieldValues> {
  /** The form fields the API can report on */
  fields: readonly FieldPath<T>[]
  /** The field a 409 belongs to, such as the SKU or the email */
  conflict?: FieldPath<T>
}

/**
 * Puts the API's messages next to their fields. Returns what is left to show
 * in a banner, or null when every message found a field.
 */
export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  { fields, conflict }: Options<T>,
): string | null {
  if (!(error instanceof ApiError)) return GENERIC

  let placed = false
  for (const [name, messages] of Object.entries(error.fieldErrors)) {
    // The backend names properties in PascalCase; the form uses camelCase
    const field = fields.find((f) => f.toLowerCase() === name.toLowerCase())
    const message = messages[0]
    if (field && message) {
      setError(field, { message })
      placed = true
    }
  }

  if (error.status === 409 && conflict) {
    setError(conflict, { message: error.message })
    placed = true
  }

  return placed ? null : error.message
}
