import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

import { type CatalogFilters, parseFilters, toSearchParams } from './filters'

export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])

  const setFilters = useCallback(
    (changes: Partial<CatalogFilters>, options: { replace?: boolean } = {}) => {
      const isPageChange = 'page' in changes
      setSearchParams(toSearchParams({ ...filters, page: 1, ...changes }), {
        replace: options.replace,
        preventScrollReset: !isPageChange,
      })
    },
    [filters, setSearchParams],
  )

  return [filters, setFilters] as const
}
