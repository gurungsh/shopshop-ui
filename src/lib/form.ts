/** The values of the fields the user changed, for a partial update */
export function changedFields<T extends object>(
  values: T,
  dirty: Partial<Record<keyof T, unknown>>,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(values).filter(([name]) => dirty[name as keyof T]),
  ) as Partial<T>
}

export function formText(data: FormData, name: string) {
  const value = data.get(name)
  return typeof value === 'string' ? value.trim() : ''
}
