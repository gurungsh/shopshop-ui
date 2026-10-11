import { useQuery } from '@tanstack/react-query'

import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'

import { categoriesQuery, productListQuery } from '../api/queries'
import { CategoryFilter } from '../components/CategoryFilter'
import { PriceFilter } from '../components/PriceFilter'
import { ProductCard } from '../components/ProductCard'
import {
  emptyFilters,
  hasFilters,
  PAGE_SIZE,
  toProductQuery,
} from '../lib/filters'
import { useCatalogFilters } from '../lib/use-catalog-filters'
import styles from './CatalogPage.module.css'

export function CatalogPage() {
  const [filters, setFilters] = useCatalogFilters()
  const products = useQuery(productListQuery(toProductQuery(filters)))
  const categories = useQuery(categoriesQuery())

  const categoryNames = new Map(
    categories.data?.map((category) => [category.id, category.name]),
  )
  const title = filters.q.trim()
    ? `Results for “${filters.q.trim()}”`
    : 'All products'

  function clearFilters() {
    setFilters(emptyFilters)
  }

  return (
    <>
      <title>{`${title} · ShopShop`}</title>

      <div className={styles.heading}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.count} aria-live="polite">
          {products.data &&
            `${String(products.data.totalCount)} ${products.data.totalCount === 1 ? 'product' : 'products'}`}
        </p>
      </div>

      <div className={styles.layout}>
        <aside aria-label="Filters" className={styles.filters}>
          <CategoryFilter
            categories={categories.data}
            isError={categories.isError}
            selected={filters.categoryIds}
            onChange={(categoryIds) => {
              setFilters({ categoryIds })
            }}
          />
          <PriceFilter
            min={filters.min}
            max={filters.max}
            onChange={(range) => {
              setFilters(range)
            }}
          />
          <Button
            variant="secondary"
            disabled={!hasFilters(filters)}
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </aside>

        <section aria-label="Products" className={styles.results}>
          {products.isError && !products.data && (
            <Banner
              title="We couldn’t load the products."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void products.refetch()}
                >
                  Try again
                </Button>
              }
            >
              Check your connection, then try again.
            </Banner>
          )}

          {products.isPending && (
            <div className={styles.grid} aria-hidden="true">
              {Array.from({ length: PAGE_SIZE }, (_, index) => (
                <Skeleton key={index} className={styles.cardSkeleton} />
              ))}
            </div>
          )}

          {products.data?.items.length === 0 &&
            (filters.page > 1 ? (
              <div className={styles.empty}>
                <p>There are no products on page {filters.page}.</p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFilters({ page: 1 })
                  }}
                >
                  Go to page 1
                </Button>
              </div>
            ) : (
              <div className={styles.empty}>
                <p>No products match these filters.</p>
                {hasFilters(filters) && (
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            ))}

          {products.data && products.data.items.length > 0 && (
            <ul
              className={styles.grid}
              aria-busy={products.isPlaceholderData}
              data-stale={products.isPlaceholderData}
            >
              {products.data.items.map((product) => (
                <li key={product.id}>
                  <ProductCard
                    product={product}
                    categoryName={categoryNames.get(product.categoryId)}
                  />
                </li>
              ))}
            </ul>
          )}

          {products.data && products.data.totalPages > 1 && (
            <Pagination
              page={filters.page}
              totalPages={products.data.totalPages}
              onPageChange={(page) => {
                setFilters({ page })
              }}
            />
          )}
        </section>
      </div>
    </>
  )
}
