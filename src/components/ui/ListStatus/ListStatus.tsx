import { Banner } from '../Banner'
import { Button } from '../Button'
import { Skeleton } from '../Skeleton'
import styles from './ListStatus.module.css'

interface ListStatusProps {
  /** Plural, lowercase: "products" */
  noun: string
  isPending: boolean
  /** The request failed and there is nothing to show */
  isError: boolean
  isEmpty: boolean
  page: number
  onRetry: () => void
  onFirstPage: () => void
}

/** What to show instead of a table: an error, a loading state or "none" */
export function ListStatus({
  noun,
  isPending,
  isError,
  isEmpty,
  page,
  onRetry,
  onFirstPage,
}: ListStatusProps) {
  if (isError) {
    return (
      <Banner
        title={`We couldn’t load the ${noun}.`}
        action={
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        }
      >
        Check your connection, then try again.
      </Banner>
    )
  }

  if (isPending) {
    return (
      <div aria-hidden="true" className={styles.skeleton}>
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className={styles.row} />
        ))}
      </div>
    )
  }

  if (!isEmpty) return null

  return (
    <div className={styles.empty}>
      {page > 1 ? (
        <>
          <p>
            There are no {noun} on page {page}.
          </p>
          <Button variant="secondary" onClick={onFirstPage}>
            Go to page 1
          </Button>
        </>
      ) : (
        <p>No {noun} match these filters.</p>
      )}
    </div>
  )
}
