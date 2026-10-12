import { Banner } from '../Banner'
import { Button } from '../Button'
import { Skeleton } from '../Skeleton'
import styles from './DetailStatus.module.css'

interface DetailStatusProps {
  /** Singular, lowercase: "product" */
  noun: string
  notFound: boolean
  isError: boolean
  onRetry: () => void
}

/** What to show in place of a record that has not loaded */
export function DetailStatus({
  noun,
  notFound,
  isError,
  onRetry,
}: DetailStatusProps) {
  if (notFound) return <p>We couldn’t find that {noun}. Check the link.</p>

  if (isError) {
    return (
      <Banner
        title={`We couldn’t load this ${noun}.`}
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

  return <Skeleton className={styles.skeleton} />
}
