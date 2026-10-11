import { Search } from 'lucide-react'
import { useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'

import { useSyncedState } from '@/lib/use-synced-state'

import { emptyFilters, parseFilters, toSearchParams } from '../lib/filters'
import styles from './HeaderSearch.module.css'

const DEBOUNCE_MS = 300

export function HeaderSearch() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const onCatalog = pathname === '/'
  const urlQuery = onCatalog ? (searchParams.get('q') ?? '') : ''
  const [value, setValue] = useSyncedState(urlQuery)

  function catalogUrl(q: string) {
    const current = onCatalog ? parseFilters(searchParams) : emptyFilters
    const params = toSearchParams({ ...current, q, page: 1 })
    return { pathname: '/', search: params.toString() }
  }

  useEffect(() => {
    if (!onCatalog || value === urlQuery) return

    const timer = setTimeout(() => {
      const current = parseFilters(searchParams)
      const params = toSearchParams({ ...current, q: value, page: 1 })
      void navigate(
        { pathname: '/', search: params.toString() },
        { replace: urlQuery !== '', preventScrollReset: true },
      )
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
    }
  }, [value, urlQuery, onCatalog, searchParams, navigate])

  return (
    <form
      role="search"
      className={styles.search}
      onSubmit={(event) => {
        event.preventDefault()
        void navigate(catalogUrl(value))
      }}
    >
      <Search size={18} aria-hidden="true" className={styles.icon} />
      <label htmlFor="header-search" className="sr-only">
        Search products
      </label>
      <input
        id="header-search"
        type="search"
        placeholder="Search products"
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
        }}
        className={styles.input}
      />
    </form>
  )
}
