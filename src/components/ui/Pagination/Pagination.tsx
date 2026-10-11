import { clsx } from 'clsx'

import { Button } from '../Button'
import styles from './Pagination.module.css'
import { pageItems } from './page-items'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  return (
    <nav aria-label="Pagination" className={clsx(styles.pagination, className)}>
      <p className={styles.status}>
        Page {page} of {totalPages}
      </p>

      <div className={styles.controls}>
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => {
            onPageChange(page - 1)
          }}
        >
          Previous
        </Button>

        {pageItems(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <span key={`gap-${String(index)}`} className={styles.gap}>
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${String(item)}`}
              aria-current={item === page ? 'page' : undefined}
              className={styles.page}
              onClick={() => {
                onPageChange(item)
              }}
            >
              {item}
            </button>
          ),
        )}

        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => {
            onPageChange(page + 1)
          }}
        >
          Next
        </Button>
      </div>
    </nav>
  )
}
