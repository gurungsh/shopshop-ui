export const PAGE_SIZE = 20

const GUID = /^[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}$/

export function isGuid(value: string) {
  return GUID.test(value)
}

export function parsePage(params: URLSearchParams) {
  const page = Number(params.get('page'))
  return Number.isInteger(page) && page > 1 ? page : 1
}

/** A URL can hold anything, so a bad number is dropped instead of sent */
export function parseAmount(value: string) {
  return value.trim() !== '' && Number.isFinite(Number(value))
    ? Number(value)
    : undefined
}
