import { useState } from 'react'

export function useSyncedState<T>(outside: T) {
  const [value, setValue] = useState(outside)
  const [previous, setPrevious] = useState(outside)

  if (outside !== previous) {
    setPrevious(outside)
    setValue(outside)
  }

  return [value, setValue] as const
}
